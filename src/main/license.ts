import { app } from 'electron'
import { machineIdSync } from 'node-machine-id'
import * as keytar from 'keytar'
import os from 'os'
import fs from 'fs'
import { join } from 'path'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVICE_NAME = 'BellaMD'
const ACCOUNT_NAME = 'license-token'
const LICENSE_KEY_ACCOUNT = 'license-key'
const API_BASE_URL = process.env.API_BASE_URL || 'https://bellamarkdown.com'
const HEARTBEAT_INTERVAL = 7 * 24 * 60 * 60 * 1000 // 7 days
const GRACE_PERIOD = 30 * 24 * 60 * 60 * 1000 // 30 days

// ---------------------------------------------------------------------------
// Cached machine ID
// ---------------------------------------------------------------------------

let cachedMachineId: string | null = null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]
  return JSON.parse(Buffer.from(payload, 'base64url').toString())
}

function licenseStatePath(): string {
  return join(app.getPath('userData'), 'license-state.json')
}

// ---------------------------------------------------------------------------
// Machine info
// ---------------------------------------------------------------------------

export function getMachineId(): string {
  if (!cachedMachineId) {
    cachedMachineId = machineIdSync()
  }
  return cachedMachineId
}

export function getMachineName(): string {
  return os.hostname()
}

export function getOS(): string {
  return process.platform
}

// ---------------------------------------------------------------------------
// Keytar: token storage
// ---------------------------------------------------------------------------

export async function getStoredToken(): Promise<string | null> {
  return keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
}

export async function storeToken(token: string): Promise<void> {
  await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token)
}

export async function clearToken(): Promise<void> {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME)
}

// ---------------------------------------------------------------------------
// Keytar: license key storage
// ---------------------------------------------------------------------------

export async function getStoredLicenseKey(): Promise<string | null> {
  return keytar.getPassword(SERVICE_NAME, LICENSE_KEY_ACCOUNT)
}

export async function storeLicenseKey(key: string): Promise<void> {
  await keytar.setPassword(SERVICE_NAME, LICENSE_KEY_ACCOUNT, key)
}

export async function clearLicenseKey(): Promise<void> {
  await keytar.deletePassword(SERVICE_NAME, LICENSE_KEY_ACCOUNT)
}

// ---------------------------------------------------------------------------
// License state (local JSON file)
// ---------------------------------------------------------------------------

export function getLicenseState(): { lastValidated: number } | null {
  try {
    const data = fs.readFileSync(licenseStatePath(), 'utf-8')
    return JSON.parse(data) as { lastValidated: number }
  } catch {
    return null
  }
}

export function saveLicenseState(state: { lastValidated: number }): void {
  fs.writeFileSync(licenseStatePath(), JSON.stringify(state, null, 2), 'utf-8')
}

function clearLicenseState(): void {
  try {
    fs.unlinkSync(licenseStatePath())
  } catch {
    // File may not exist; that's fine.
  }
}

// ---------------------------------------------------------------------------
// API: Activate license
// ---------------------------------------------------------------------------

export async function activateLicense(
  licenseKey: string
): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/license/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        machineId: getMachineId(),
        machineName: getMachineName(),
        os: getOS()
      })
    })

    const data = (await response.json()) as Record<string, unknown>

    if (response.ok) {
      const token = data.token as string
      await storeToken(token)
      await storeLicenseKey(licenseKey)
      saveLicenseState({ lastValidated: Date.now() })
      return { success: true, token }
    }

    return { success: false, error: (data.error as string) || 'Activation failed' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// API: Heartbeat
// ---------------------------------------------------------------------------

export async function sendHeartbeat(): Promise<boolean> {
  try {
    const licenseKey = await getStoredLicenseKey()
    if (!licenseKey) return false

    const response = await fetch(`${API_BASE_URL}/api/license/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        machineId: getMachineId()
      })
    })

    if (response.ok) {
      saveLicenseState({ lastValidated: Date.now() })
      return true
    }

    return false
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// API: Validate license
// ---------------------------------------------------------------------------

export async function validateLicense(): Promise<{ valid: boolean; reason?: string }> {
  const token = await getStoredToken()
  if (!token) {
    return { valid: false, reason: 'no-token' }
  }

  // Decode JWT payload (without cryptographic verification)
  let payload: Record<string, unknown>
  try {
    payload = decodeJwtPayload(token)
  } catch {
    return { valid: false, reason: 'invalid-token' }
  }

  // Check expiry
  const expiresAt = payload.expiresAt as string | number | undefined
  if (expiresAt) {
    const expiryMs = typeof expiresAt === 'number' ? expiresAt : new Date(expiresAt).getTime()
    if (Date.now() > expiryMs) {
      return { valid: false, reason: 'expired' }
    }
  }

  // Check machine ID matches
  const tokenMachineId = payload.machineId as string | undefined
  if (tokenMachineId && tokenMachineId !== getMachineId()) {
    return { valid: false, reason: 'machine-mismatch' }
  }

  // Check heartbeat freshness
  const state = getLicenseState()
  const lastValidated = state?.lastValidated ?? 0
  const timeSinceValidation = Date.now() - lastValidated

  if (timeSinceValidation > HEARTBEAT_INTERVAL) {
    const heartbeatOk = await sendHeartbeat()

    if (!heartbeatOk) {
      if (timeSinceValidation > GRACE_PERIOD) {
        return { valid: false, reason: 'grace-expired' }
      }
      // Within grace period — allow offline use
      return { valid: true }
    }
  }

  return { valid: true }
}

// ---------------------------------------------------------------------------
// API: Deactivate device
// ---------------------------------------------------------------------------

export async function deactivateDevice(): Promise<{ success: boolean; error?: string }> {
  try {
    const licenseKey = await getStoredLicenseKey()
    if (!licenseKey) {
      return { success: false, error: 'No license key found' }
    }

    const response = await fetch(`${API_BASE_URL}/api/license/deactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        machineId: getMachineId()
      })
    })

    const data = (await response.json()) as Record<string, unknown>

    if (response.ok) {
      await clearToken()
      await clearLicenseKey()
      clearLicenseState()
      return { success: true }
    }

    return { success: false, error: (data.error as string) || 'Deactivation failed' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { success: false, error: message }
  }
}
