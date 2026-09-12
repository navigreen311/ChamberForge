import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * Health scores across the book.
 *
 * P-20 (T-027, T-053). Three hardcoded rows, served to anyone. Worth noting
 * that they did not even agree with the other fabrications: this handler
 * called `c-001` "Johnson Family Trust" while the list handler called the
 * same id "Jonathan Wellington III". Two invented datasets, disagreeing
 * about the same client.
 *
 * Now read from `Client`, scoped to the session operator, lowest score
 * first - the order a reader of this list actually needs.
 */

export async function GET() {
  const session = await requireSession()
  if (!session.ok) return session.response

  const clients = await prisma.client.findMany({
    where: { userId: session.userId, status: { not: 'alumni' } },
    select: {
      id: true,
      name: true,
      tier: true,
      healthScore: true,
      healthTrend: true,
    },
  })

  // Unscored clients sort last rather than as zero: not yet scored is not
  // the same as scored badly, and a new client would otherwise head the list.
  const ordered = [...clients].sort(
    (a, b) => (a.healthScore ?? 101) - (b.healthScore ?? 101)
  )

  return NextResponse.json(
    ordered.map((client) => ({
      id: client.id,
      name: client.name,
      tier: client.tier,
      score: client.healthScore,
      trend:
        client.healthTrend === null
          ? null
          : client.healthTrend > 0
            ? 'improving'
            : client.healthTrend < 0
              ? 'declining'
              : 'stable',
      trend_points: client.healthTrend,
    }))
  )
}
