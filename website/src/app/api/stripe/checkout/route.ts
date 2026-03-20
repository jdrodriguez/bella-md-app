import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { eq, and, isNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { db } from '@/db'
import { affiliates } from '@/db/schema'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  if (!session.user.email) {
    return NextResponse.json(
      { error: 'No email on session' },
      { status: 400 },
    )
  }

  // Read referral cookie and validate the affiliate
  let referralCode: string | undefined
  try {
    const cookieStore = await cookies()
    const refCookie = cookieStore.get('bellamd_ref')

    if (refCookie?.value) {
      const [affiliate] = await db
        .select()
        .from(affiliates)
        .where(
          and(
            eq(affiliates.code, refCookie.value),
            eq(affiliates.status, 'active'),
            isNull(affiliates.deletedAt),
          ),
        )
        .limit(1)

      // Validate affiliate exists, is active, and is not self-referral
      if (affiliate && affiliate.userId !== session.user.id) {
        referralCode = affiliate.code
      }
    }
  } catch {
    // If cookie reading or affiliate lookup fails, proceed without referral
  }

  try {
    const metadata: Record<string, string> = {
      userId: session.user.id,
    }
    if (referralCode) {
      metadata.referralCode = referralCode
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: session.user.email,
      metadata,
      subscription_data: {
        metadata,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BellaMD Annual License',
              description: 'Full access to BellaMD Markdown editor',
            },
            unit_amount: 2500,
            recurring: {
              interval: 'year',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/pricing`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}
