import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * The operator's morning brief.
 *
 * P-19 (T-027, T-053). This returned a fixed brief to anyone who asked,
 * including two lines that deserve naming:
 *
 *     { category: 'market',      summary: 'S&P 500 up 1.2% — tech sector leading' }
 *     { category: 'regulatory',  summary: 'New SEC disclosure requirements effective Q3' }
 *
 * **The platform has no market data source and no regulatory feed.** Those
 * were not stale figures — there was never anything behind them. An advisor
 * reading a market move or an SEC deadline off their console, and acting on
 * it with a client, is the sharpest form of the fabrication defect this run
 * has found: unlike an invented KPI, this one is *designed* to be repeated
 * to a third party.
 *
 * `alerts` and `actions` are real and derived from the operator's own data.
 * `changes` is now an explicit absence: `available: false` with a reason,
 * carrying no items at all. A caller that ignores the flag and reads
 * `changes.items` gets an empty list, never a plausible headline.
 */

const STALE_CONTACT_DAYS = 14
const RENEWAL_HORIZON_DAYS = 30
const MAX_PER_SECTION = 10

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const userId = session.userId
  const now = new Date()
  const staleBefore = new Date(now.getTime() - STALE_CONTACT_DAYS * 86_400_000)
  const renewalHorizon = new Date(
    now.getTime() + RENEWAL_HORIZON_DAYS * 86_400_000
  )

  const [risks, overdueDeliverables, dueTasks, renewals, staleClients] =
    await Promise.all([
      prisma.riskReviewItem.findMany({
        where: {
          userId,
          status: 'pending',
          riskLevel: { in: ['critical', 'high'] },
        },
        orderBy: { createdAt: 'desc' },
        take: MAX_PER_SECTION,
        select: { id: true, title: true, riskLevel: true, sourceModule: true },
      }),

      prisma.deliverable.findMany({
        where: {
          userId,
          deliveredAt: null,
          slaDate: { lt: now },
        },
        orderBy: { slaDate: 'asc' },
        take: MAX_PER_SECTION,
        select: {
          id: true,
          name: true,
          slaDate: true,
          priority: true,
          client: { select: { name: true } },
        },
      }),

      prisma.task.findMany({
        where: { userId, completedAt: null, dueAt: { lte: now } },
        orderBy: { dueAt: 'asc' },
        take: MAX_PER_SECTION,
        select: {
          id: true,
          name: true,
          dueAt: true,
          priority: true,
          client: { select: { name: true } },
        },
      }),

      prisma.client.findMany({
        where: {
          userId,
          status: 'active',
          renewalDate: { gte: now, lte: renewalHorizon },
        },
        orderBy: { renewalDate: 'asc' },
        take: MAX_PER_SECTION,
        select: { id: true, name: true, renewalDate: true },
      }),

      prisma.client.findMany({
        where: {
          userId,
          status: 'active',
          OR: [{ lastContactAt: null }, { lastContactAt: { lt: staleBefore } }],
        },
        orderBy: { lastContactAt: 'asc' },
        take: MAX_PER_SECTION,
        select: { id: true, name: true, lastContactAt: true },
      }),
    ])

  return NextResponse.json({
    date: now.toISOString().split('T')[0],

    // No market data source and no regulatory feed exist. Stated, not filled.
    changes: {
      available: false,
      reason: 'no_market_or_regulatory_source',
      detail:
        'ChamberForge has no market data or regulatory feed connected. Market and regulatory commentary is not available and is not inferred.',
      items: [],
    },

    alerts: risks.map((risk) => ({
      id: risk.id,
      severity: risk.riskLevel,
      source: risk.sourceModule,
      message: risk.title,
    })),

    actions: [
      ...overdueDeliverables.map((d) => ({
        id: d.id,
        kind: 'deliverable_overdue' as const,
        priority: d.priority,
        title: d.name,
        client: d.client.name,
        dueAt: d.slaDate.toISOString(),
      })),
      ...dueTasks.map((t) => ({
        id: t.id,
        kind: 'task_due' as const,
        priority: t.priority,
        title: t.name,
        client: t.client?.name ?? null,
        dueAt: t.dueAt.toISOString(),
      })),
      ...renewals.map((c) => ({
        id: c.id,
        kind: 'renewal_upcoming' as const,
        priority: 'medium',
        title: `Renewal due for ${c.name}`,
        client: c.name,
        dueAt: c.renewalDate!.toISOString(),
      })),
      ...staleClients.map((c) => ({
        id: c.id,
        kind: 'contact_stale' as const,
        priority: 'low',
        title: c.lastContactAt
          ? `No contact with ${c.name} in ${STALE_CONTACT_DAYS} days`
          : `No contact recorded for ${c.name}`,
        client: c.name,
        dueAt: null,
      })),
    ],
  })
}
