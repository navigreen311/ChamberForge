import { NextResponse } from 'next/server'

import { requireSession } from '@/lib/require-session'

/**
 * Save a revenue projection.
 *
 * P-19 (T-027, T-053). **This handler told the operator their work was
 * saved and saved nothing.** In full:
 *
 *     // TODO: Save to database via Prisma
 *     const projectionId = `proj-${Date.now()}`
 *     return NextResponse.json({
 *       success: true,
 *       projectionId,
 *       message: `Projection saved: ...`,
 *     })
 *
 * `success: true`, an id minted from the clock, and a confirmation message
 * quoting the operator's own figures back at them. Every signal a caller
 * could check said the write had happened. It had not, and the projection
 * was gone the moment the response was sent.
 *
 * This is the worst failure mode in the run so far, because it is not a
 * wrong number on a screen — it is a person believing their work is stored.
 * Everything else this package found could be caught by someone who looked
 * closely at a figure. This one is invisible until they come back for it.
 *
 * **It cannot be fixed here.** There is no `Projection` model in
 * `schema.prisma`, and `frontend/prisma/**` is P-01's under the shared-file
 * map — needing a model is an escalation, not an edit. So the handler now
 * refuses honestly: **501**, `saved: false`, and a reason. A refusal the
 * operator can see beats a confirmation they cannot verify.
 *
 * The request body is still validated, so the shape stays pinned for
 * whoever implements the model. See PARALLEL_BUILD_ESCALATION.md.
 */

type ProjectionRequest = {
  offerName?: unknown
  clients?: unknown
  ratePerMonth?: unknown
  monthlyRevenue?: unknown
}

export async function POST(request: Request) {
  const session = await requireSession()
  if (!session.ok) return session.response

  let body: ProjectionRequest
  try {
    body = (await request.json()) as ProjectionRequest
  } catch {
    return NextResponse.json(
      { error_code: 'invalid_body', message: 'A JSON body is required.' },
      { status: 400 }
    )
  }

  const missing = (['offerName', 'clients', 'ratePerMonth'] as const).filter(
    (field) => body[field] === undefined || body[field] === null
  )
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error_code: 'invalid_body',
        message: `Missing required fields: ${missing.join(', ')}.`,
      },
      { status: 400 }
    )
  }

  return NextResponse.json(
    {
      saved: false,
      error_code: 'not_implemented',
      message:
        'Revenue projections cannot be saved yet. This request was not stored.',
      detail:
        'There is no Projection model in the database schema. This endpoint previously reported success without writing anything; it now refuses rather than confirm a save that did not happen.',
    },
    { status: 501 }
  )
}
