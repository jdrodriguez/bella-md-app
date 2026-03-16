import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { licenses, activations } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { licenseKey, machineId } = body

  if (!licenseKey || !machineId) {
    return NextResponse.json(
      { error: 'licenseKey and machineId are required' },
      { status: 400 },
    )
  }

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.licenseKey, licenseKey),
  })

  if (!license) {
    return NextResponse.json({ valid: false, reason: 'Invalid license key' })
  }

  if (license.status !== 'active') {
    return NextResponse.json({ valid: false, reason: `License is ${license.status}` })
  }

  if (license.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, reason: 'License has expired' })
  }

  const [updated] = await db
    .update(activations)
    .set({ lastHeartbeatAt: new Date() })
    .where(
      and(
        eq(activations.licenseId, license.id),
        eq(activations.machineId, machineId),
        isNull(activations.deactivatedAt),
      ),
    )
    .returning()

  if (!updated) {
    return NextResponse.json({ valid: false, reason: 'No active activation for this machine' })
  }

  return NextResponse.json({
    valid: true,
    expiresAt: license.expiresAt.toISOString(),
  })
}
