import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * The risk review queue.
 *
 * P-19 (T-027, T-053). Three hardcoded items, served to anyone — including
 * "Concentration limit breach — Johnson Trust tech allocation at 42%",
 * which reads as a live compliance finding against a named family.
 *
 * The queue is a work list: an operator clears it. An invented item wastes
 * an advisor's morning; a *missing* item is a compliance finding nobody
 * worked. Both failure modes were present, because the list had no
 * connection to the data at all.
 *
 * Now scoped to the session operator and read from `RiskReviewItem`, open
 * items first, most severe first.
 */

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

const OPEN_STATUS = 'pending'

export async function GET(request: Request) {
  const session = await requireSession()
  if (!session.ok) return session.response

  const params = new URL(request.url).searchParams
  // The queue means open items; `?status=all` is for a review history view.
  const wantsAll = params.get('status') === 'all'

  const items = await prisma.riskReviewItem.findMany({
    where: {
      userId: session.userId,
      ...(wantsAll ? {} : { status: OPEN_STATUS }),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      sourceModule: true,
      riskLevel: true,
      status: true,
      reviewer: true,
      reviewNotes: true,
      createdAt: true,
      reviewedAt: true,
    },
  })

  // Ordered in the application rather than the query: `riskLevel` is a string
  // column, so Postgres would sort it alphabetically - critical, high, low,
  // medium - putting `low` above `medium`. Sorting by a severity rank keeps
  // the worst item at the top, which is the only ordering a queue can have.
  const ordered = [...items].sort((a, b) => {
    const rank =
      (SEVERITY_ORDER[a.riskLevel] ?? 99) - (SEVERITY_ORDER[b.riskLevel] ?? 99)
    return rank !== 0 ? rank : b.createdAt.getTime() - a.createdAt.getTime()
  })

  return NextResponse.json(
    ordered.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type,
      sourceModule: item.sourceModule,
      riskLevel: item.riskLevel,
      status: item.status,
      reviewer: item.reviewer,
      reviewNotes: item.reviewNotes,
      createdAt: item.createdAt.toISOString(),
      reviewedAt: item.reviewedAt ? item.reviewedAt.toISOString() : null,
    }))
  )
}
