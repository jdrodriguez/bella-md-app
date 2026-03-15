import { db } from '@/db'
import { licenses, activations } from '@/db/schema'
import { eq, and, isNull, count } from 'drizzle-orm'
import crypto from 'crypto'

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I ambiguity

function randomBlock(length: number): string {
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length]
  }
  return result
}

export function generateLicenseKey(): string {
  return `BLMD-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}`
}

export async function verifyLicenseKey(key: string) {
  const license = await db.query.licenses.findFirst({
    where: eq(licenses.licenseKey, key),
  })

  if (!license) return null

  const activeCount = await getActivationCount(license.id)

  return { license, activeCount }
}

export async function createLicense(userId: string, expiresAt: Date) {
  const key = generateLicenseKey()

  const [license] = await db
    .insert(licenses)
    .values({
      userId,
      licenseKey: key,
      expiresAt,
    })
    .returning()

  return license
}

export async function getActivationCount(licenseId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(activations)
    .where(
      and(
        eq(activations.licenseId, licenseId),
        isNull(activations.deactivatedAt),
      ),
    )

  return result.count
}
