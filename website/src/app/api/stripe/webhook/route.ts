import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNull } from 'drizzle-orm'
import { getStripe } from '@/lib/stripe'
import { db } from '@/db'
import { affiliates, licenses, orders, referrals } from '@/db/schema'
import { createLicense } from '@/lib/license'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in checkout session metadata')
          break
        }

        // Idempotency: check if order already exists for this session
        const existingOrder = await db.query.orders.findFirst({
          where: eq(orders.stripeSessionId, session.id),
        })

        let order = existingOrder

        if (!existingOrder) {
          const expiresAt = new Date()
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)

          // Only create license if user doesn't have one yet
          const existingLicense = await db.query.licenses.findFirst({
            where: eq(licenses.userId, userId),
          })

          const license =
            existingLicense ?? (await createLicense(userId, expiresAt))

          ;[order] = await db
            .insert(orders)
            .values({
              userId,
              licenseId: license.id,
              stripeCustomerId: session.customer as string,
              stripeSessionId: session.id,
              stripeSubscriptionId: session.subscription as string,
              amount: session.amount_total ?? 2500,
              currency: session.currency ?? 'usd',
            })
            .returning()
        }

        // Track referral if a referral code was passed through checkout
        const referralCode = session.metadata?.referralCode
        if (referralCode && order) {
          // Idempotency: skip if a referral already exists for this order
          const existingReferral = await db.query.referrals.findFirst({
            where: eq(referrals.orderId, order.id),
          })

          if (!existingReferral) {
            const [affiliate] = await db
              .select()
              .from(affiliates)
              .where(
                and(
                  eq(affiliates.code, referralCode),
                  eq(affiliates.status, 'active'),
                  isNull(affiliates.deletedAt),
                ),
              )
              .limit(1)

            if (affiliate) {
              const amount = session.amount_total ?? 2500
              const commission = Math.round(
                (amount * (affiliate.commissionRate ?? 2500)) / 10000,
              )

              await db.insert(referrals).values({
                affiliateId: affiliate.id,
                referredUserId: userId,
                orderId: order.id,
                amount,
                commission,
                status: 'pending',
              })
            }
          }
        }

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionRef =
          invoice.parent?.subscription_details?.subscription
        const subscriptionId =
          typeof subscriptionRef === 'string'
            ? subscriptionRef
            : subscriptionRef?.id

        if (!subscriptionId) break

        // Skip the initial invoice — the license is already created by checkout.session.completed
        if (invoice.billing_reason === 'subscription_create') break

        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.stripeSubscriptionId, subscriptionId))
          .limit(1)

        if (!order?.licenseId) break

        const [license] = await db
          .select()
          .from(licenses)
          .where(eq(licenses.id, order.licenseId))
          .limit(1)

        if (!license) break

        const newExpiry = new Date(license.expiresAt)
        newExpiry.setFullYear(newExpiry.getFullYear() + 1)

        await db
          .update(licenses)
          .set({ expiresAt: newExpiry, status: 'active' })
          .where(eq(licenses.id, license.id))

        // Track renewal referral if the user was originally referred
        const existingReferral = await db.query.referrals.findFirst({
          where: and(
            eq(referrals.referredUserId, order.userId),
            isNull(referrals.deletedAt),
          ),
          orderBy: [referrals.createdAt],
        })

        if (existingReferral) {
          const [affiliate] = await db
            .select()
            .from(affiliates)
            .where(
              and(
                eq(affiliates.id, existingReferral.affiliateId),
                eq(affiliates.status, 'active'),
                isNull(affiliates.deletedAt),
              ),
            )
            .limit(1)

          if (affiliate && invoice.id) {
            // Idempotency: skip if a referral already exists for this invoice
            const duplicateReferral = await db.query.referrals.findFirst({
              where: eq(referrals.stripeInvoiceId, invoice.id),
            })

            if (!duplicateReferral) {
              const renewalAmount = invoice.amount_paid ?? 2500
              const renewalCommission = Math.round(
                (renewalAmount * (affiliate.commissionRate ?? 2500)) / 10000,
              )

              await db.insert(referrals).values({
                affiliateId: affiliate.id,
                referredUserId: order.userId,
                stripeInvoiceId: invoice.id,
                amount: renewalAmount,
                commission: renewalCommission,
                status: 'pending',
              })
            }
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id

        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.stripeSubscriptionId, subscriptionId))
          .limit(1)

        if (!order?.licenseId) break

        await db
          .update(licenses)
          .set({ status: 'expired' })
          .where(eq(licenses.id, order.licenseId))

        break
      }
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ received: true })
}
