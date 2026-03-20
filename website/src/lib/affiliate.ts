import { db } from '@/db'
import { affiliates } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import crypto from 'crypto'

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I ambiguity

export function generateReferralCode(): string {
  const bytes = crypto.randomBytes(8)
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += CHARSET[bytes[i] % CHARSET.length]
  }
  return result
}

export async function createAffiliate(userId: string) {
  const code = generateReferralCode()
  const [affiliate] = await db
    .insert(affiliates)
    .values({ userId, code })
    .onConflictDoUpdate({
      target: affiliates.userId,
      set: { userId },
    })
    .returning()
  return affiliate
}

export async function getAffiliateByUserId(userId: string) {
  return db.query.affiliates.findFirst({
    where: and(eq(affiliates.userId, userId), isNull(affiliates.deletedAt)),
  })
}

export async function getAffiliateByCode(code: string) {
  return db.query.affiliates.findFirst({
    where: and(eq(affiliates.code, code), isNull(affiliates.deletedAt)),
  })
}
