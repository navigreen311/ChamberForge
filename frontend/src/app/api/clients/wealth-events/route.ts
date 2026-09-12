import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * Wealth events across the book, with the client attached.
 *
 * P-20 (T-027, T-053). Four hardcoded events served to anyone — a $12M
 * endowment, an $8M inheritance, a $200M IPO, a $5M practice sale, each
 * against a named person.
 *
 * These rows are the most sensitive thing this platform holds: a family, and
 * a sum of money arriving. Served without a session.
 *
 * Now read from `WealthEvent` joined to its client, scoped to the session
 * operator. The dollar figures the old payload carried in `description` are
 * whatever the record actually says - nothing is parsed out of the text into
 * a `value` field, because a number lifted from prose by a regex is a guess
 * wearing a number's clothes.
 */

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

export async function GET(request: Request) {
  const session = await requireSession()
  if (!session.ok) return session.response

  const params = new URL(request.url).searchParams
  const requested = Number(params.get('limit') ?? DEFAULT_LIMIT)
  const limit =
    Number.isFinite(requested) && requested > 0
      ? Math.min(Math.floor(requested), MAX_LIMIT)
      : DEFAULT_LIMIT

  const type = params.get('type')

  const events = await prisma.wealthEvent.findMany({
    where: {
      userId: session.userId,
      ...(type ? { type } : {}),
      // This view is the book, so it wants events attached to a client.
      // Unattached detections are real but belong on the global feed at
      // /api/wealth-events, which P-19 owns.
      clientId: { not: null },
    },
    orderBy: { detectedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      description: true,
      personName: true,
      detectedAt: true,
      client: {
        select: { id: true, name: true, company: true, status: true, tier: true },
      },
    },
  })

  return NextResponse.json(
    events.map((event) => ({
      id: event.id,
      client_id: event.client?.id ?? null,
      client_name: event.client?.name ?? null,
      client_company: event.client?.company ?? null,
      client_status: event.client?.status ?? null,
      client_tier: event.client?.tier ?? null,
      event_type: event.type,
      description: event.description,
      person_name: event.personName,
      detected_at: event.detectedAt.toISOString(),
    }))
  )
}
