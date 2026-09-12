import { NextRequest, NextResponse } from 'next/server'

import { daysSince, daysUntil, trendLabel } from '@/app/api/clients/_rules'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * The client list.
 *
 * P-20 (T-027, T-053). This served **eight fictional families** to anyone who
 * asked — names, companies, retainers, health scores, and in several cases
 * the size of an inheritance or a business sale. The filtering, sorting and
 * pagination were all real; they operated on a literal array.
 *
 * The list is now read from `Client`, scoped to the session operator, with
 * the same query surface preserved so callers keep working.
 *
 * **Two fields are gone rather than guessed.** `kpis_defined` / `kpis_total`
 * and `touchpoints_count` have no source: nothing in the schema records a
 * touchpoint, and an offer's `kpis` array is per-offer, not a per-client
 * coverage ratio. They are reported once at the top level as unavailable,
 * rather than repeated as a null on every row.
 *
 * `tier` returns the real values — `HNW` and `UHNW`. The old payload used
 * platinum / gold / silver, a vocabulary that exists nowhere in this
 * platform and which P-19 found invented in the revenue handler too.
 */

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

const SORTS = {
  name: { name: 'asc' },
  health_score: { healthScore: 'desc' },
  '-health_score': { healthScore: 'asc' },
  monthly_retainer: { monthlyRetainer: 'desc' },
  last_contact_days: { lastContactAt: 'desc' },
} as const

type SortKey = keyof typeof SORTS

export async function GET(request: NextRequest) {
  const session = await requireSession()
  if (!session.ok) return session.response

  const params = new URL(request.url).searchParams

  const status = params.get('status')
  const tier = params.get('tier')
  const painCategory = params.get('pain_category')
  const trustChannel = params.get('trust_channel')
  const q = params.get('q')

  const sortParam = params.get('sort') ?? 'name'
  const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : 'name'

  const page = Math.max(1, Number(params.get('page') ?? 1) || 1)
  const rawLimit = Number(params.get('limit') ?? DEFAULT_LIMIT)
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT

  const where = {
    userId: session.userId,
    ...(status ? { status } : {}),
    ...(tier ? { tier } : {}),
    ...(painCategory ? { painCategories: { has: painCategory } } : {}),
    ...(trustChannel ? { trustChannel } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { company: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [total, rows] = await Promise.all([
    prisma.client.count({ where }),
    prisma.client.findMany({
      where,
      orderBy: SORTS[sort],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        company: true,
        tier: true,
        status: true,
        painCategories: true,
        lastContactAt: true,
        lastContactType: true,
        healthScore: true,
        healthTrend: true,
        monthlyRetainer: true,
        renewalDate: true,
        trustChannel: true,
        onboardedAt: true,
        createdAt: true,
        _count: { select: { offers: true } },
        wealthEvents: {
          orderBy: { detectedAt: 'desc' },
          take: 1,
          select: { type: true, description: true, detectedAt: true },
        },
      },
    }),
  ])

  return NextResponse.json({
    data: rows.map((client) => ({
      id: client.id,
      name: client.name,
      company: client.company,
      tier: client.tier,
      status: client.status,
      pain_categories: client.painCategories,
      last_contact_at: client.lastContactAt?.toISOString() ?? null,
      last_contact_type: client.lastContactType,
      last_contact_days: daysSince(client.lastContactAt),
      health_score: client.healthScore,
      health_trend: trendLabel(client.healthTrend),
      health_trend_points: client.healthTrend,
      monthly_retainer: client.monthlyRetainer,
      renewal_date: client.renewalDate?.toISOString() ?? null,
      renewal_days: daysUntil(client.renewalDate),
      trust_channel: client.trustChannel,
      offers_count: client._count.offers,
      onboarded_at: client.onboardedAt?.toISOString() ?? null,
      created_at: client.createdAt.toISOString(),
      // The most recent event, or null. Never a placeholder.
      wealth_event: client.wealthEvents[0]
        ? {
            type: client.wealthEvents[0].type,
            description: client.wealthEvents[0].description,
            detected_at: client.wealthEvents[0].detectedAt.toISOString(),
          }
        : null,
    })),
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      sort,
    },
    unavailable: [
      {
        fields: ['kpis_defined', 'kpis_total'],
        reason: 'no_kpi_coverage_model',
        detail:
          'Nothing records which KPIs are defined for a client. An offer carries its own `kpis` array, which is not a per-client coverage ratio.',
      },
      {
        fields: ['touchpoints_count'],
        reason: 'no_touchpoint_model',
        detail:
          'There is no touchpoint record in the schema. Only the most recent contact is stored, on the client itself.',
      },
    ],
  })
}
