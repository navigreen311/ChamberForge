import { NextResponse } from 'next/server'

import {
  HEALTH_FLOOR,
  RENEWAL_WINDOW_DAYS,
  STALE_CONTACT_DAYS,
} from '@/app/api/clients/_rules'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * Summary counters for the Clients screen.
 *
 * P-20 (T-027, T-053). Nine hardcoded numbers, served to anyone.
 *
 * Seven of the nine are genuine counts and are now counted. The two `_delta`
 * fields are not: `active_delta: 1` and `mrr_delta: 12` describe movement
 * since some earlier moment, and nothing records what the book looked like
 * then. They return `null` with a reason, for the same cause P-19 found on
 * the dashboard - there is no periodic snapshot anywhere in the schema.
 *
 * `at_risk_count` deliberately applies the **same three rules** as
 * `/api/clients/at-risk`, and the thresholds come from a shared
 * module rather than being re-declared, so the counter and the list can never disagree. Two
 * copies of a risk rule drifting apart is how a screen ends up saying
 * "1 at risk" above a list of three.
 */

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const userId = session.userId
  const now = new Date()
  const staleBefore = new Date(now.getTime() - STALE_CONTACT_DAYS * 86_400_000)
  const renewalHorizon = new Date(
    now.getTime() + RENEWAL_WINDOW_DAYS * 86_400_000
  )
  const periodStart = new Date(now.getTime() - 30 * 86_400_000)

  const [
    activeCount,
    prospectCount,
    retainer,
    health,
    atRisk,
    wealthEvents,
    renewalsDue,
  ] = await Promise.all([
    prisma.client.count({ where: { userId, status: 'active' } }),
    prisma.client.count({ where: { userId, status: 'prospect' } }),
    prisma.client.aggregate({
      where: { userId, status: 'active' },
      _sum: { monthlyRetainer: true },
    }),
    prisma.client.aggregate({
      where: { userId, status: 'active' },
      _avg: { healthScore: true },
    }),
    prisma.client.count({
      where: {
        userId,
        status: { not: 'alumni' },
        OR: [
          { healthScore: { lt: HEALTH_FLOOR } },
          { healthTrend: { lt: 0 } },
          { lastContactAt: null },
          { lastContactAt: { lt: staleBefore } },
        ],
      },
    }),
    prisma.wealthEvent.count({
      where: { userId, detectedAt: { gte: periodStart } },
    }),
    prisma.client.count({
      where: {
        userId,
        status: 'active',
        renewalDate: { gte: now, lte: renewalHorizon },
      },
    }),
  ])

  return NextResponse.json({
    active_count: activeCount,
    prospect_count: prospectCount,
    mrr: retainer._sum.monthlyRetainer ?? 0,
    avg_health:
      health._avg.healthScore === null
        ? null
        : Math.round(health._avg.healthScore * 10) / 10,
    at_risk_count: atRisk,
    wealth_events_count: wealthEvents,
    renewals_due: renewalsDue,

    active_delta: null,
    mrr_delta: null,
    deltasUnavailable: {
      fields: ['active_delta', 'mrr_delta'],
      reason: 'no_period_history',
      detail:
        'Client status and retainer are stored as current values only, so the size of the book thirty days ago is not recoverable. A periodic snapshot would restore both.',
    },

    window: {
      wealth_events_days: 30,
      renewals_due_days: RENEWAL_WINDOW_DAYS,
      at_risk_rules: {
        health_floor: HEALTH_FLOOR,
        stale_contact_days: STALE_CONTACT_DAYS,
      },
    },
  })
}
