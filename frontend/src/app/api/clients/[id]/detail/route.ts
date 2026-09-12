import { NextResponse } from 'next/server'

import { daysSince, daysUntil, trendLabel } from '@/app/api/clients/_rules'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * A single client's detail view.
 *
 * P-20 (T-027, T-053). This served a hardcoded record for exactly two ids,
 * `c-001` and `c-003`, and 404'd for the other six the list handler showed —
 * a list of eight where two rows opened.
 *
 * What the two records contained is the reason this handler needed rewriting
 * rather than merely gating. Alongside the invented figures were invented
 * **private observations about a named family**:
 *
 *     'Spouse expressed frustration with lack of consolidated reporting'
 *     'Delayed response to last two follow-up emails'
 *     'Dinner meeting with Jonathan and spouse; discussed succession timeline'
 *
 * An advisor reading those believes their client is unhappy, and acts on it.
 * Nothing recorded them; they were prose in a route file, served to anyone.
 *
 * The record is now read from `Client`, scoped to the session operator, with
 * its real offers and wealth events. Four sections are **absent rather than
 * generated** — see `unavailable` in the payload, and §3 of the escalation.
 */

const RECENT_EVENTS = 10

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession()
  if (!session.ok) return session.response

  const client = await prisma.client.findFirst({
    // Scoped by operator as well as id: a client id from another operator's
    // book must read as absent, not as forbidden. A 403 would confirm the
    // record exists.
    where: { id: params.id, userId: session.userId },
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
      offers: {
        select: {
          id: true,
          name: true,
          status: true,
          priceMin: true,
          priceMax: true,
          pricingModel: true,
          healthScore: true,
          renewalDate: true,
        },
      },
      wealthEvents: {
        orderBy: { detectedAt: 'desc' },
        take: RECENT_EVENTS,
        select: {
          id: true,
          type: true,
          description: true,
          personName: true,
          detectedAt: true,
        },
      },
    },
  })

  if (!client) {
    // No identifier in the payload - this route carries PII and an error
    // body is the easiest place for one to escape into a log.
    return NextResponse.json(
      { error_code: 'not_found', message: 'Client not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
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
    onboarded_at: client.onboardedAt?.toISOString() ?? null,
    created_at: client.createdAt.toISOString(),

    offers: client.offers.map((offer) => ({
      id: offer.id,
      name: offer.name,
      status: offer.status,
      price_min: offer.priceMin,
      price_max: offer.priceMax,
      pricing_model: offer.pricingModel,
      health_score: offer.healthScore,
      renewal_date: offer.renewalDate?.toISOString() ?? null,
    })),

    wealth_events: client.wealthEvents.map((event) => ({
      id: event.id,
      type: event.type,
      description: event.description,
      person_name: event.personName,
      detected_at: event.detectedAt.toISOString(),
    })),

    unavailable: [
      {
        fields: ['pain_signals'],
        reason: 'no_pain_signal_record',
        detail:
          'Nothing records observations about a client relationship. The previous values were written prose, and an advisor acting on an invented signal is the harm this removes.',
      },
      {
        fields: ['recommended_actions'],
        reason: 'no_recommendation_source',
        detail:
          'No model produces recommendations for a client. Advice is not inferred here.',
      },
      {
        fields: ['recent_touchpoints'],
        reason: 'no_touchpoint_model',
        detail:
          'There is no touchpoint history in the schema - only the single most recent contact, returned above as last_contact_at.',
      },
      {
        fields: ['household_summary'],
        reason: 'household_owned_by_backend',
        detail:
          'Household composition lives in the FastAPI household_graph tables, not in Prisma, and the BFF has no authenticated server-to-server channel to reach it. See /api/clients/[id]/household-graph/summary.',
      },
    ],
  })
}
