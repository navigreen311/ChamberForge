import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * The revenue console.
 *
 * P-19 (T-027, T-053). Eight metrics and a four-tier revenue breakdown, all
 * hardcoded, served without a session.
 *
 * Three of the eight cannot be derived from this platform's data at any
 * effort, and saying so is the substance of this handler:
 *
 *   - **CAC** needs acquisition spend. Nothing in the schema records what
 *     was spent to win a client, so a customer acquisition cost is not a
 *     hard number here — it is a number from somewhere else entirely. The
 *     old payload said `$8,400`.
 *   - **LTV** follows from CAC's absence and from margin, which is likewise
 *     unrecorded. The old payload said `$168,000`, and `ltvCacRatio: 20`
 *     — a ratio of two figures neither of which exists.
 *   - **Net retention** needs per-period expansion and contraction. Nothing
 *     is versioned, so the prior period cannot be reconstructed.
 *
 * The rest are computed. **MRR is the contracted retainer**, summed from
 * active clients, and the payload says so in `source`: Stripe subscriptions
 * are P-29's and largely unwritten, so billed revenue and contracted revenue
 * are not the same number today. Naming the source is what stops a reader
 * treating one as the other.
 *
 * `revenueByTier` groups by the real `Client.tier` values. The old payload's
 * platinum / gold / silver / bronze do not exist anywhere in this
 * platform — the tiers are `HNW` and `UHNW`.
 */

type Metric = {
  value: number | null
  trend: number | null
  direction: 'up' | 'down' | 'stable' | null
  source?: string
  unavailable?: { reason: string; detail: string }
}

function unavailable(reason: string, detail: string): Metric {
  return { value: null, trend: null, direction: null, unavailable: { reason, detail } }
}

/** A figure we can compute, whose movement we cannot. */
function known(value: number, source: string, reason: string, detail: string): Metric {
  return {
    value,
    trend: null,
    direction: null,
    source,
    unavailable: { reason, detail },
  }
}

const NO_HISTORY = {
  reason: 'no_period_history',
  detail:
    'Revenue figures are stored as current values only. Reconstructing the prior period needs a periodic snapshot, which does not exist.',
}

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const userId = session.userId

  const [activeClients, retainerTotal, byTier] = await Promise.all([
    prisma.client.count({ where: { userId, status: 'active' } }),
    prisma.client.aggregate({
      where: { userId, status: 'active' },
      _sum: { monthlyRetainer: true },
    }),
    prisma.client.groupBy({
      by: ['tier'],
      where: { userId, status: 'active' },
      _count: { _all: true },
      _sum: { monthlyRetainer: true },
    }),
  ])

  const mrr = retainerTotal._sum.monthlyRetainer ?? 0
  const CONTRACTED = 'contracted_retainer'

  const tiers = byTier.map((row) => ({
    tier: row.tier,
    clients: row._count._all,
    revenue: row._sum.monthlyRetainer ?? 0,
    // Share of contracted revenue, to one decimal. Zero total means no
    // share exists rather than a share of zero.
    pct:
      mrr === 0
        ? null
        : Math.round(((row._sum.monthlyRetainer ?? 0) / mrr) * 1000) / 10,
  }))

  return NextResponse.json({
    mrr: known(
      mrr,
      CONTRACTED,
      NO_HISTORY.reason,
      NO_HISTORY.detail
    ),

    arr: known(
      mrr * 12,
      CONTRACTED,
      NO_HISTORY.reason,
      NO_HISTORY.detail
    ),

    avgRevenuePerClient: activeClients === 0
      ? unavailable(
          'no_active_clients',
          'There are no active clients, so an average per client is undefined rather than zero.'
        )
      : known(
          Math.round(mrr / activeClients),
          CONTRACTED,
          NO_HISTORY.reason,
          NO_HISTORY.detail
        ),

    netRetentionRate: unavailable(
      'no_period_history',
      'Net retention needs per-period expansion and contraction. Nothing in the schema is versioned, so the prior period cannot be reconstructed.'
    ),

    churnRate: unavailable(
      'no_subscription_history',
      'Churn needs subscription starts and cancellations over a period. Subscription records are written by billing (P-29), which has not run.'
    ),

    ltv: unavailable(
      'no_margin_or_lifetime_data',
      'Lifetime value needs margin and an observed customer lifetime. Neither is recorded.'
    ),

    cac: unavailable(
      'no_acquisition_cost_data',
      'Customer acquisition cost needs acquisition spend. Nothing in this platform records what was spent to win a client.'
    ),

    ltvCacRatio: unavailable(
      'depends_on_unavailable_inputs',
      'Both LTV and CAC are unavailable, so their ratio is not computable.'
    ),

    revenueByTier: {
      source: CONTRACTED,
      tiers,
    },
  })
}
