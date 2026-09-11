import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * Twelve months of revenue history.
 *
 * P-19 (T-027, T-053). This returned a hand-written twelve-month series
 * climbing smoothly from $218,000 to $284,500 — a growth curve, with client
 * counts, new clients and churn for every month, none of which happened.
 * It is the chart an operator would screenshot into a board deck.
 *
 * **Real history comes from paid invoices**, which is the one thing in the
 * schema that is genuinely time-stamped and immutable: `Invoice.paidAt` and
 * `amountCents`. Months are produced from those rows, plus the number of
 * distinct clients who paid in each.
 *
 * What is deliberately *not* here: `newClients` and `churned`. Both need
 * subscription starts and cancellations, which billing (P-29) writes and
 * which do not exist yet — and inferring "churned" from the absence of an
 * invoice would turn a billing gap into a lost client. The months carry
 * `null` for both, with the reason stated once at the top level.
 *
 * A deployment that has never billed returns an empty series and says why,
 * rather than a flat line at zero that reads as twelve months of no revenue.
 */

const MONTHS = 12

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const now = new Date()
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1), 1)
  )

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.userId,
      status: 'paid',
      paidAt: { gte: start },
    },
    select: { amountCents: true, paidAt: true, clientId: true },
  })

  // Bucket by calendar month. Done in the application rather than with a
  // raw date_trunc query so the month boundaries are UTC and match the keys
  // the chart renders, rather than the database session's timezone.
  const buckets = new Map<string, { cents: number; clients: Set<string> }>()
  for (const invoice of invoices) {
    if (!invoice.paidAt) continue
    const key = monthKey(invoice.paidAt)
    const bucket = buckets.get(key) ?? { cents: 0, clients: new Set<string>() }
    bucket.cents += invoice.amountCents
    if (invoice.clientId) bucket.clients.add(invoice.clientId)
    buckets.set(key, bucket)
  }

  const months = Array.from({ length: MONTHS }, (_, i) => {
    const date = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)
    )
    return monthKey(date)
  })

  const series = months.map((month) => {
    const bucket = buckets.get(month)
    return {
      month,
      mrr: bucket ? Math.round(bucket.cents / 100) : 0,
      clients: bucket ? bucket.clients.size : 0,
      newClients: null,
      churned: null,
    }
  })

  const billed = invoices.length > 0

  return NextResponse.json({
    source: 'paid_invoices',
    // An empty series is a real answer - it means nothing has been billed -
    // but it must not be mistaken for twelve months of zero revenue.
    available: billed,
    ...(billed
      ? {}
      : {
          reason: 'no_paid_invoices',
          detail:
            'No paid invoices exist in the last twelve months, so there is no billed revenue history. Invoices are written by billing (P-29), which has not run.',
        }),
    movementUnavailable: {
      reason: 'no_subscription_history',
      detail:
        'New and churned client counts need subscription starts and cancellations, which billing (P-29) writes. Absence of an invoice is not churn, so neither figure is inferred.',
    },
    months: billed ? series : [],
  })
}
