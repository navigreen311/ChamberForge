import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * The wealth-event feed.
 *
 * P-19 (T-027, T-053). This returned two invented events — a $3.2M
 * inheritance for "Rivera Foundation", an $850K liquidity event for
 * "Nakamura Holdings" — to anyone who asked, with no session.
 *
 * These are the most sensitive rows in the platform. A wealth event names a
 * family and a sum of money, and this handler served them to unauthenticated
 * callers. That the particular rows were fictional is not a mitigation: the
 * route was built to return real ones.
 *
 * Now scoped to the session operator and read from `WealthEvent`.
 *
 * **Two fields the old payload had are gone rather than guessed.** `impact`
 * ("high" / "medium") and `value` (a dollar figure) have no column on the
 * model. An inheritance's size is exactly the kind of number that must not
 * be inferred from a description string, so the feed returns what the record
 * holds — `type`, `description`, `personName`, the client, and when it was
 * detected — and nothing it does not. See PARALLEL_BUILD_ESCALATION.md.
 */

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export async function GET(request: Request) {
  const session = await requireSession()
  if (!session.ok) return session.response

  const requested = Number(
    new URL(request.url).searchParams.get('limit') ?? DEFAULT_LIMIT
  )
  const limit =
    Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), MAX_LIMIT)
      : DEFAULT_LIMIT

  const events = await prisma.wealthEvent.findMany({
    where: { userId: session.userId },
    orderBy: { detectedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      description: true,
      personName: true,
      detectedAt: true,
      client: { select: { id: true, name: true, company: true, tier: true } },
    },
  })

  return NextResponse.json(
    events.map((event) => ({
      id: event.id,
      type: event.type,
      description: event.description,
      personName: event.personName,
      detectedAt: event.detectedAt.toISOString(),
      // Null when the event is not yet attributed to a client on file, which
      // is a real state - detection can precede attribution.
      client: event.client
        ? {
            id: event.client.id,
            name: event.client.name,
            company: event.client.company,
            tier: event.client.tier,
          }
        : null,
    }))
  )
}
