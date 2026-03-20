import { redirect } from "next/navigation"
import { eq, and, isNull, desc, sql } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { affiliates, referrals, payouts } from "@/db/schema"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SignupButton } from "./signup-button"
import { CopyLinkButton } from "./copy-link-button"

export const metadata = { title: "Affiliate Program — BellaMD" }

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default async function AffiliatePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const affiliate = await db.query.affiliates.findFirst({
    where: and(
      eq(affiliates.userId, session.user.id),
      isNull(affiliates.deletedAt),
    ),
  })

  if (!affiliate) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          <AffiliateHero />
        </main>
        <Footer />
      </div>
    )
  }

  const activeReferrals = and(
    eq(referrals.affiliateId, affiliate.id),
    isNull(referrals.deletedAt),
  )

  const [countsResult, earningsResult, recentReferrals, affiliatePayouts] =
    await Promise.all([
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(referrals)
        .where(activeReferrals),
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
      db.query.referrals.findMany({
        where: activeReferrals,
        orderBy: [desc(referrals.createdAt)],
        limit: 20,
      }),
      db.query.payouts.findMany({
        where: and(
          eq(payouts.affiliateId, affiliate.id),
          isNull(payouts.deletedAt),
        ),
        orderBy: [desc(payouts.paidAt)],
      }),
    ])

  const totalReferrals = countsResult[0]?.total ?? 0
  const totalEarnings = earningsResult[0]?.totalEarnings ?? 0
  const pendingEarnings = earningsResult[0]?.pendingEarnings ?? 0
  const paidEarnings = earningsResult[0]?.paidEarnings ?? 0

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Affiliate Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your link and earn 25% on every referral.
        </p>

        <div className="mt-8 space-y-8">
          {/* Referral Link */}
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-sm font-medium text-muted-foreground">
              Your referral link
            </h2>
            <div className="mt-2">
              <CopyLinkButton code={affiliate.code} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Referrals" value={String(totalReferrals)} />
            <StatCard label="Total Earned" value={formatCents(totalEarnings)} />
            <StatCard label="Pending" value={formatCents(pendingEarnings)} />
            <StatCard label="Paid Out" value={formatCents(paidEarnings)} />
          </div>

          {/* Recent Referrals */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Recent Referrals
            </h2>

            {recentReferrals.length === 0 ? (
              <div className="mt-4 rounded-xl border border-border bg-background p-6 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">
                  No referrals yet. Share your link to start earning.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted">
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Amount
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Commission
                        </th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recentReferrals.map((r) => (
                        <tr key={r.id}>
                          <td className="px-4 py-3 text-muted-foreground">
                            {r.createdAt?.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }) ?? "-"}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {formatCents(r.amount)}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {formatCents(r.commission)}
                          </td>
                          <td className="px-4 py-3">
                            <ReferralStatusBadge status={r.status ?? "pending"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 sm:hidden">
                  {recentReferrals.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-border bg-background p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground">
                          {r.createdAt?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }) ?? "-"}
                        </p>
                        <ReferralStatusBadge status={r.status ?? "pending"} />
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Amount</dt>
                          <dd className="text-foreground">
                            {formatCents(r.amount)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Commission</dt>
                          <dd className="text-foreground">
                            {formatCents(r.commission)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payout History */}
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Payout History
            </h2>

            {affiliatePayouts.length === 0 ? (
              <div className="mt-4 rounded-xl border border-border bg-background p-6 text-center shadow-sm">
                <p className="text-sm text-muted-foreground">
                  No payouts yet. Commissions are paid out once approved.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {affiliatePayouts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-4 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {formatCents(p.amount)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.paidAt?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) ?? "-"}{" "}
                        &middot;{" "}
                        <span className="capitalize">{p.method ?? "manual"}</span>
                      </p>
                    </div>
                    <PayoutStatusBadge status={p.status ?? "completed"} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function AffiliateHero() {
  const benefits = [
    {
      title: "25% Commission",
      description:
        "Earn on every payment your referrals make, including renewals.",
    },
    {
      title: "30-Day Cookie",
      description:
        "Visitors who click your link are tracked for a full 30 days.",
    },
    {
      title: "Instant Approval",
      description: "No waiting period. Sign up and start earning right away.",
    },
  ]

  return (
    <div className="text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        Earn with BellaMD
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
        Join our affiliate program and earn 25% commission on every purchase
        made through your referral link.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="rounded-xl border border-border bg-background p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-foreground">
              {b.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {b.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <SignupButton />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </dd>
    </div>
  )
}

function ReferralStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    approved:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    paid: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  )
}

function PayoutStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    completed:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  )
}
