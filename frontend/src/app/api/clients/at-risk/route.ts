import { NextResponse } from 'next/server'

import {
  HEALTH_FLOOR,
  RENEWAL_WINDOW_DAYS,
  STALE_CONTACT_DAYS,
  daysSince,
  daysUntil,
} from '@/app/api/clients/_rules'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * Clients at risk.
 *
 * P-20 (T-027, T-053). Two hardcoded families, each with an invented
 * `risk_reason` and a `recommended_action` telling the advisor what to do
 * about a situation that did not exist.
 *
 * A false entry here costs an advisor a difficult, unnecessary conversation.
 * A **missing** entry is a client who churns unnoticed. The old handler could
 * produce both, because the list had no connection to any data.
 *
 * Risk is now evaluated against the client's own record, by three rules that
 * are stated in the payload rather than left implicit. `risk_reason` names
 * the rule that actually fired and quotes the value that fired it, so an
 * advisor can check the judgement rather than take it on trust.
 *
 * `recommended_action` is **not** returned. It was invented advice
 * ("Send personalized outreach referencing inheritance"), and nothing in
 * this platform generates recommendations. Naming the trigger tells an
 * advisor what is wrong; inventing the remedy tells them what to do about it,
 * and those are different claims.
 */

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const now = new Date()
  const staleBefore = new Date(now.getTime() - STALE_CONTACT_DAYS * 86_400_000)
  const renewalHorizon = new Date(
    now.getTime() + RENEWAL_WINDOW_DAYS * 86_400_000
  )

  const candidates = await prisma.client.findMany({
    where: {
      userId: session.userId,
      status: { not: 'alumni' },
      OR: [
        { healthScore: { lt: HEALTH_FLOOR } },
        { healthTrend: { lt: 0 } },
        { lastContactAt: null },
        { lastContactAt: { lt: staleBefore } },
        { renewalDate: { gte: now, lte: renewalHorizon } },
      ],
    },
    select: {
      id: true,
      name: true,
      company: true,
      tier: true,
      status: true,
      healthScore: true,
      healthTrend: true,
      lastContactAt: true,
      renewalDate: true,
    },
  })

  const atRisk = candidates
    .map((client) => {
      const contactDays = daysSince(client.lastContactAt)
      const renewalDays = daysUntil(client.renewalDate)
      const reasons: string[] = []

      if (client.healthScore !== null && client.healthScore < HEALTH_FLOOR) {
        reasons.push(
          `Health score ${client.healthScore} is below the ${HEALTH_FLOOR} threshold`
        )
      }
      if (client.healthTrend !== null && client.healthTrend < 0) {
        reasons.push(`Health score is down ${Math.abs(client.healthTrend)} points`)
      }
      if (contactDays === null) {
        reasons.push('No contact has ever been recorded')
      } else if (contactDays > STALE_CONTACT_DAYS) {
        reasons.push(`No contact recorded in ${contactDays} days`)
      }
      if (
        renewalDays !== null &&
        renewalDays >= 0 &&
        renewalDays <= RENEWAL_WINDOW_DAYS &&
        (client.healthTrend ?? 0) < 0
      ) {
        reasons.push(
          `Renewal in ${renewalDays} days while the health score is falling`
        )
      }

      return { client, reasons, contactDays, renewalDays }
    })
    // The query is a superset - a client can match the OR on a renewal date
    // alone without a falling trend. Only rows where a rule actually fired
    // are returned, so the list means what it says.
    .filter((row) => row.reasons.length > 0)
    .sort((a, b) => {
      if (b.reasons.length !== a.reasons.length) {
        return b.reasons.length - a.reasons.length
      }
      return (a.client.healthScore ?? 101) - (b.client.healthScore ?? 101)
    })

  return NextResponse.json({
    rules: {
      health_floor: HEALTH_FLOOR,
      stale_contact_days: STALE_CONTACT_DAYS,
      renewal_window_days: RENEWAL_WINDOW_DAYS,
    },
    recommendationsUnavailable: {
      reason: 'no_recommendation_source',
      detail:
        'Nothing in this platform generates advice. The trigger is reported; the remedy is the advisor’s call.',
    },
    clients: atRisk.map(({ client, reasons, contactDays, renewalDays }) => ({
      id: client.id,
      name: client.name,
      company: client.company,
      tier: client.tier,
      status: client.status,
      health_score: client.healthScore,
      health_trend_points: client.healthTrend,
      last_contact_days: contactDays,
      renewal_days: renewalDays,
      risk_reasons: reasons,
    })),
  })
}
