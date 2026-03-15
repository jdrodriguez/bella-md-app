import { NextRequest, NextResponse } from 'next/server'
import { verifyLicenseKey } from '@/lib/license'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { licenseKey } = body

  if (!licenseKey) {
    return NextResponse.json(
      { error: 'licenseKey is required' },
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

  return NextResponse.json({
    status: license.status,
    plan: license.plan,
    expiresAt: license.expiresAt.toISOString(),
    activeDevices: activeCount,
    maxDevices: license.maxDevices,
  })
}
