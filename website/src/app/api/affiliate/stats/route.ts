import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAffiliateByUserId } from '@/lib/affiliate'
import { db } from '@/db'
import { referrals, payouts } from '@/db/schema'
import { eq, and, isNull, desc, sql } from 'drizzle-orm'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  try {
    const affiliate = await getAffiliateByUserId(session.user.id)

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate account not found' },
        { status: 404 },
      )
    }

    const activeReferrals = and(
      eq(referrals.affiliateId, affiliate.id),
      isNull(referrals.deletedAt),
    )

    const [countsResult, earningsResult, recentReferrals, affiliatePayouts] =
      await Promise.all([
        // Total referrals count
        db
          .select({ total: sql<number>`count(*)::int` })
          .from(referrals)
          .where(activeReferrals),

        // Earnings breakdown in a single query
        db
          .select({
            totalEarnings:
              sql<number>`coalesce(sum(case when ${referrals.status} != 'pending' then ${referrals.commission} else 0 end), 0)::int`,
            pendingEarnings:
              sql<number>`coalesce(sum(case when ${referrals.status} = 'pending' then ${referrals.commission} else 0 end), 0)::int`,
            paidEarnings:
              sql<number>`coalesce(sum(case when ${referrals.status} = 'paid' then ${referrals.commission} else 0 end), 0)::int`,
          })
          .from(referrals)
          .where(activeReferrals),

        // Recent referrals
        db.query.referrals.findMany({
          where: activeReferrals,
          orderBy: [desc(referrals.createdAt)],
          limit: 20,
        }),

        // Payouts history
        db.query.payouts.findMany({
          where: and(
            eq(payouts.affiliateId, affiliate.id),
            isNull(payouts.deletedAt),
          ),
          orderBy: [desc(payouts.paidAt)],
        }),
      ])

    return NextResponse.json({
      affiliate: {
        code: affiliate.code,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status,
        createdAt: affiliate.createdAt,
      },
      stats: {
        totalReferrals: countsResult[0]?.total ?? 0,
        totalEarnings: earningsResult[0]?.totalEarnings ?? 0,
        pendingEarnings: earningsResult[0]?.pendingEarnings ?? 0,
        paidEarnings: earningsResult[0]?.paidEarnings ?? 0,
      },
      recentReferrals: recentReferrals.map((r) => ({
        amount: r.amount,
        commission: r.commission,
        status: r.status,
        createdAt: r.createdAt,
      })),
      payouts: affiliatePayouts.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        status: p.status,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    console.error('Affiliate stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch affiliate stats' },
      { status: 500 },
    )
  }
}
