import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { activations } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { SignJWT } from 'jose'
import { verifyLicenseKey } from '@/lib/license'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET)

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { licenseKey, machineId, machineName, os } = body

  if (!licenseKey || !machineId) {
    return NextResponse.json(
      { error: 'licenseKey and machineId are required' },
      { status: 400 },
    )
  }

  const result = await verifyLicenseKey(licenseKey)

  if (!result) {
    return NextResponse.json(
      { error: 'Invalid license key' },
      { status: 404 },
    )
  }

  const { license, activeCount } = result

  if (license.status !== 'active') {
    return NextResponse.json(
      { error: `License is ${license.status}` },
      { status: 403 },
    )
  }

  if (license.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'License has expired' },
      { status: 403 },
    )
  }

  // Check if this machine is already activated
  const existing = await db.query.activations.findFirst({
    where: and(
      eq(activations.licenseId, license.id),
      eq(activations.machineId, machineId),
      isNull(activations.deactivatedAt),
    ),
  })

  if (existing) {
    const token = await new SignJWT({
      licenseId: license.id,
      machineId,
      expiresAt: license.expiresAt.toISOString(),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(license.expiresAt)
      .sign(secret)

    return NextResponse.json({ token, activation: existing })
  }

  // Check device limit
  if (activeCount >= (license.maxDevices ?? 3)) {
    return NextResponse.json(
      { error: 'Device limit reached', maxDevices: license.maxDevices },
      { status: 409 },
    )
  }

  // Create new activation
  const [activation] = await db
    .insert(activations)
    .values({
      licenseId: license.id,
      machineId,
      machineName: machineName ?? null,
      os: os ?? null,
    })
    .returning()

  const token = await new SignJWT({
    licenseId: license.id,
    machineId,
    expiresAt: license.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(license.expiresAt)
    .sign(secret)

  return NextResponse.json({ token, activation }, { status: 201 })
}
