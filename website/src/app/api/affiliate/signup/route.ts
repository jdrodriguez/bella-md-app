import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createAffiliate, getAffiliateByUserId } from '@/lib/affiliate'

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  try {
    const existing = await getAffiliateByUserId(session.user.id)

    if (existing) {
      return NextResponse.json({ affiliate: existing }, { status: 200 })
    }

    const affiliate = await createAffiliate(session.user.id)

    return NextResponse.json({ affiliate }, { status: 201 })
  } catch (error) {
    console.error('Affiliate signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create affiliate account' },
      { status: 500 },
    )
  }
}
