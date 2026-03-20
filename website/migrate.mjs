import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS "affiliates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL UNIQUE REFERENCES "user"("id"),
    "code" text NOT NULL UNIQUE,
    "commissionRate" integer DEFAULT 2500,
    "status" text DEFAULT 'active',
    "paypalEmail" text,
    "createdAt" timestamp DEFAULT now(),
    "deletedAt" timestamp
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS "referrals" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "affiliateId" uuid NOT NULL REFERENCES "affiliates"("id"),
    "referredUserId" uuid NOT NULL REFERENCES "user"("id"),
    "orderId" uuid REFERENCES "orders"("id"),
    "stripeInvoiceId" text,
    "amount" integer NOT NULL,
    "commission" integer NOT NULL,
    "status" text DEFAULT 'pending',
    "createdAt" timestamp DEFAULT now(),
    "deletedAt" timestamp
  )
`

await sql`CREATE INDEX IF NOT EXISTS "referrals_affiliate_idx" ON "referrals" ("affiliateId")`
await sql`CREATE INDEX IF NOT EXISTS "referrals_referred_user_idx" ON "referrals" ("referredUserId")`

await sql`
  CREATE TABLE IF NOT EXISTS "payouts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "affiliateId" uuid NOT NULL REFERENCES "affiliates"("id"),
    "amount" integer NOT NULL,
    "method" text DEFAULT 'manual',
    "reference" text,
    "status" text DEFAULT 'pending',
    "paidAt" timestamp DEFAULT now(),
    "createdAt" timestamp DEFAULT now(),
    "deletedAt" timestamp
  )
`

console.log('Migration complete: affiliate tables ready')
await sql.end()
