import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * Generate a pre-meeting intelligence brief for a client.
 *
 * P-20 (T-027, T-053). **This is the most serious fabrication the run has
 * found, and the reason is what the output was for.**
 *
 * The handler assembled a brief from templates keyed on `brief_type`, filled
 * with the client's name, and returned it as intelligence. A dashboard KPI
 * that is invented misleads an operator at their desk. This was written to be
 * *carried into a meeting and said out loud to the client*, and it contained:
 *
 *   - **financial claims about the client's own money** — "tax savings of
 *     $180K", "net savings of $180K", "3 vendor negotiations closed",
 *     "Portfolio underperformed benchmark by 1.2% in Q1";
 *   - **a satisfaction figure** — "client satisfaction survey results
 *     (92nd percentile)" — from no survey;
 *   - **invented private observations** — "Spouse expressed concern about
 *     consolidated reporting gaps", "Delayed response to last two follow-up
 *     emails suggests potential dissatisfaction";
 *   - **a scripted opener** putting words in the advisor's mouth, using the
 *     client's first name;
 *   - **objection handling** citing the invented figures as proof.
 *
 * An advisor telling a family "we saved you $180K this quarter" from a number
 * a template produced is a misrepresentation to a client about their own
 * affairs. Nothing downstream could have caught it: the payload was
 * well-formed and the figures were plausible.
 *
 * **It is not reimplemented here, and it is not replaced with a lesser
 * brief.** The card is explicit that this route must call the backend
 * intel-brief service rather than reimplement it, and that service is real —
 * `POST /api/v1/lifecycle/intel-brief/{client_id}` builds a brief from the
 * client data it is given, using Claude when a key is configured and the
 * record's own fields otherwise. That is the right source.
 *
 * **The call cannot be made yet.** FastAPI authenticates with a Bearer token
 * (`HTTPBearer` in `core/dependencies.py`); the BFF holds a NextAuth session
 * and has no server-to-server channel to mint or forward one. `lib/api.ts` is
 * a browser axios instance that sends a cookie, is P-11-owned and frozen, and
 * does not work from a route handler. Building that channel is an auth design
 * decision and belongs to P-11 or P-23, not here.
 *
 * So this returns **501**. The client is still resolved and the request still
 * validated, so the moment the channel exists this becomes a proxy call and
 * nothing else. See §4 of the escalation.
 */

const BRIEF_TYPES = ['pre-meeting', 'renewal', 'quarterly-review']

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireSession()
  if (!session.ok) return session.response

  let body: { brief_type?: unknown; meeting_context?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error_code: 'invalid_body', message: 'A JSON body is required.' },
      { status: 400 }
    )
  }

  if (typeof body.brief_type !== 'string' || !body.brief_type) {
    return NextResponse.json(
      { error_code: 'invalid_body', message: 'brief_type is required.' },
      { status: 400 }
    )
  }

  if (!BRIEF_TYPES.includes(body.brief_type)) {
    return NextResponse.json(
      {
        error_code: 'invalid_body',
        message: `brief_type must be one of: ${BRIEF_TYPES.join(', ')}.`,
      },
      { status: 400 }
    )
  }

  // Resolved and scoped before anything else: a brief for a client outside
  // this operator's book must not be generable, and a client that does not
  // exist must 404 rather than produce a brief about nobody - which the old
  // handler did, under the name "Unknown Client".
  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: session.userId },
    select: { id: true },
  })

  if (!client) {
    // No identifier echoed back - this route carries PII.
    return NextResponse.json(
      { error_code: 'not_found', message: 'Client not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json(
    {
      generated: false,
      error_code: 'not_implemented',
      message:
        'Intelligence briefs cannot be generated yet. No brief was produced.',
      detail:
        'The brief is built by the backend intel-brief service, and the BFF has no authenticated server-to-server channel to call it. This endpoint previously returned a brief assembled from templates, including financial claims and private observations that no record supported.',
    },
    { status: 501 }
  )
}
