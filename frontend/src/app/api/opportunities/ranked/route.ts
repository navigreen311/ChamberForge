import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * Ranked opportunities.
 *
 * P-19 (T-027, T-053). Two hardcoded rows, served without a session, each
 * carrying a `probability` — `0.85` for the Johnson Family Trust, `0.62` for
 * the Chen Dynasty Fund.
 *
 * **There is no probability anywhere in this platform.** No model records a
 * win rate, no historical outcome is stored, and nothing scores a deal. The
 * figure was a decimal on a screen with the authority of a model behind it
 * and no model behind it. An advisor deciding where to spend the week on a
 * 0.85 is the harm, and it is the same defect as the Trust Center's invented
 * uptime and P-07's hash-derived client sentiment.
 *
 * Opportunities are now real `Offer` rows, ranked by the value at stake.
 * `probability` is absent from the payload rather than guessed — a field
 * that is not there cannot be rendered as a percentage, whereas a `null` in
 * a familiar key often is.
 *
 * `rank` is positional and honest: it says "first by value", which is what
 * the ordering is, not "most likely to close".
 */

/** Open pipeline. `active` is won and `sunset` is retired; neither is an opportunity. */
const OPEN_STATUSES = ['draft', 'proposed']

const MAX_RESULTS = 50

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const offers = await prisma.offer.findMany({
    where: { userId: session.userId, status: { in: OPEN_STATUSES } },
    take: MAX_RESULTS,
    select: {
      id: true,
      name: true,
      status: true,
      priceMin: true,
      priceMax: true,
      pricingModel: true,
      createdAt: true,
      client: { select: { id: true, name: true, company: true, tier: true } },
    },
  })

  // Ranked by the top of the quoted range, which is the value at stake if
  // the offer lands. Offers with no price sort last rather than as zero -
  // unpriced is not worthless, it is unknown, and the tiebreak is age so
  // the ordering stays stable between requests.
  const ranked = [...offers].sort((a, b) => {
    const av = a.priceMax ?? a.priceMin
    const bv = b.priceMax ?? b.priceMin
    if (av === null && bv === null) {
      return b.createdAt.getTime() - a.createdAt.getTime()
    }
    if (av === null) return 1
    if (bv === null) return -1
    if (bv !== av) return bv - av
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  return NextResponse.json({
    rankedBy: 'value_at_stake',
    probabilityUnavailable: {
      reason: 'no_win_probability_model',
      detail:
        'Nothing in this platform records deal outcomes or scores likelihood, so a close probability is not available and is not estimated.',
    },
    opportunities: ranked.map((offer, index) => ({
      id: offer.id,
      rank: index + 1,
      name: offer.name,
      lifecycle: offer.status,
      pricingModel: offer.pricingModel,
      valueLow: offer.priceMin,
      valueHigh: offer.priceMax,
      createdAt: offer.createdAt.toISOString(),
      client: offer.client
        ? {
            id: offer.client.id,
            name: offer.client.name,
            company: offer.client.company,
            tier: offer.client.tier,
          }
        : null,
    })),
  })
}
