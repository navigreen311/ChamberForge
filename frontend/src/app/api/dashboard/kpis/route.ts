import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * The six figures on the operator's dashboard.
 *
 * P-19 (T-027, T-053). This handler returned six hardcoded literals —
 * `active_clients: 127`, `monthly_retainer: 284500`, a `$12.4M` pipeline —
 * to anyone who asked, with no session and no database. An advisor opening
 * the console saw a business that did not exist, in the same shape a real
 * one would arrive in.
 *
 * **Trends are the part worth reading carefully.** Each figure came with a
 * `trend` and a `direction`, and three of the six cannot be computed from
 * the schema at all: nothing records what a client's status, retainer or
 * pipeline was thirty days ago. Those now return `trend: null` with a
 * reason, rather than a plausible percentage. A dashboard that says "we do
 * not know" is worth more than one that says "▲ 3.2" from nowhere — and a
 * null is the one value a UI cannot render as confidence.
 *
 * The three that *are* computable are computed honestly:
 *
 *   - `risk_queue` compares the queue size now against its size thirty days
 *     ago, which `createdAt` and `reviewedAt` together pin down exactly;
 *   - `wealth_events` counts the last thirty days against the thirty before;
 *   - `avg_health_score` averages `Client.healthTrend`, a per-client trend
 *     the record already carries.
 *
 * See PARALLEL_BUILD_ESCALATION.md — restoring the other three needs a
 * periodic snapshot table, which is P-01's schema and not this package's.
 */

const PERIOD_DAYS = 30

/** A figure the dashboard can show, and what is known about its movement. */
type Metric = {
  value: number | null
  trend: number | null
  direction: 'up' | 'down' | 'stable' | null
  /** Present only when the movement could not be computed. */
  unavailable?: { reason: string; detail: string }
}

function movement(current: number, previous: number): Metric['direction'] {
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'stable'
}

/** Percentage change, to one decimal. A previous of zero has no percentage. */
function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function measured(current: number, previous: number): Metric {
  const trend = percentChange(current, previous)
  return {
    value: current,
    trend,
    direction: movement(current, previous),
    ...(trend === null
      ? {
          unavailable: {
            reason: 'no_prior_value',
            detail:
              'Nothing was recorded in the previous period, so a percentage change is undefined.',
          },
        }
      : {}),
  }
}

/** A figure we have, whose movement the schema cannot tell us. */
function withoutTrend(
  value: number | null,
  reason: string,
  detail: string
): Metric {
  return { value, trend: null, direction: null, unavailable: { reason, detail } }
}

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const userId = session.userId
  const now = new Date()
  const periodStart = new Date(now.getTime() - PERIOD_DAYS * 86_400_000)
  const priorStart = new Date(now.getTime() - 2 * PERIOD_DAYS * 86_400_000)

  const [
    activeClients,
    retainer,
    pipeline,
    health,
    eventsThisPeriod,
    eventsPriorPeriod,
    riskOpenNow,
    riskOpenThen,
  ] = await Promise.all([
    prisma.client.count({ where: { userId, status: 'active' } }),

    prisma.client.aggregate({
      where: { userId, status: 'active' },
      _sum: { monthlyRetainer: true },
    }),

    // Pipeline is what is proposed but not yet won or retired. `sunset` is
    // explicitly excluded - a retired offer is not pipeline.
    prisma.offer.aggregate({
      where: { userId, status: { in: ['draft', 'proposed'] } },
      _sum: { priceMax: true },
    }),

    prisma.client.aggregate({
      where: { userId, status: 'active' },
      _avg: { healthScore: true, healthTrend: true },
    }),

    prisma.wealthEvent.count({
      where: { userId, detectedAt: { gte: periodStart } },
    }),
    prisma.wealthEvent.count({
      where: { userId, detectedAt: { gte: priorStart, lt: periodStart } },
    }),

    prisma.riskReviewItem.count({ where: { userId, status: 'pending' } }),

    // The queue as it stood thirty days ago: created by then, and either
    // still unreviewed or not reviewed until after that date. `reviewedAt`
    // is what makes this exact rather than an estimate.
    prisma.riskReviewItem.count({
      where: {
        userId,
        createdAt: { lte: periodStart },
        OR: [{ reviewedAt: null }, { reviewedAt: { gt: periodStart } }],
      },
    }),
  ])

  const avgHealthTrend = health._avg.healthTrend

  return NextResponse.json({
    active_clients: withoutTrend(
      activeClients,
      'no_status_history',
      'Client status is stored as a current value only, so the number active thirty days ago is not recoverable.'
    ),

    monthly_retainer: withoutTrend(
      retainer._sum.monthlyRetainer ?? 0,
      'no_retainer_history',
      'Retainer changes are not versioned, so the prior-period total is not recoverable.'
    ),

    pipeline_value: withoutTrend(
      pipeline._sum.priceMax ?? 0,
      'no_pipeline_history',
      'Offer price and status are stored as current values only, so the prior-period pipeline is not recoverable.'
    ),

    avg_health_score: {
      value:
        health._avg.healthScore === null
          ? null
          : Math.round(health._avg.healthScore * 10) / 10,
      // Averaging a per-client trend the record already carries - this one
      // is a real measurement, not a period comparison.
      trend:
        avgHealthTrend === null ? null : Math.round(avgHealthTrend * 10) / 10,
      direction:
        avgHealthTrend === null ? null : movement(avgHealthTrend, 0),
      ...(avgHealthTrend === null
        ? {
            unavailable: {
              reason: 'no_health_trend_recorded',
              detail: 'No active client carries a health trend.',
            },
          }
        : {}),
    } satisfies Metric,

    wealth_events: measured(eventsThisPeriod, eventsPriorPeriod),
    risk_queue: measured(riskOpenNow, riskOpenThen),
  })
}
