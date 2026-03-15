import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { licenses, activations } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const body = await request.json()
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
    return NextResponse.json(
      { error: 'Invalid license key' },
      { status: 404 },
    )
  }

  const [updated] = await db
    .update(activations)
    .set({ deactivatedAt: new Date() })
    .where(
      and(
        eq(activations.licenseId, license.id),
        eq(activations.machineId, machineId),
        isNull(activations.deactivatedAt),
      ),
    )
    .returning()

  if (!updated) {
    return NextResponse.json(
      { error: 'No active activation found for this machine' },
      { status: 404 },
    )
  }

  return NextResponse.json({ success: true, deactivatedAt: updated.deactivatedAt })
}
