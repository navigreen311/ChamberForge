import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/require-session'

/**
 * A client's household: people, vendors and properties.
 *
 * P-20 (T-027, T-053). This returned a hardcoded household for two ids,
 * **to anyone, with no session**. For `c-001` that was five named family
 * members — a spouse, two adult children, a parent — three named
 * professional firms, and **four street addresses**:
 *
 *     '1240 Park Avenue, New York, NY'      primary residence
 *     '88 Oceanview Dr, Palm Beach, FL'     vacation
 *     '15 Rue de Rivoli, Paris, France'     investment
 *     '200 Commerce Blvd, Greenwich, CT'    commercial
 *
 * A household roster with home addresses is the single most sensitive
 * artefact this platform can produce, and for a firm serving UHNW families
 * it is the artefact a physical-security threat would want. Served
 * unauthenticated. That these particular families are fictional is not the
 * mitigation it appears to be — the route was built to return real ones, and
 * would have, from the first real record onward.
 *
 * **Household data is not in Prisma.** Under D4 it lives in the FastAPI
 * `household_graph` tables, which are among the non-overlapping tables that
 * stack keeps, reached through `GET /api/v1/household/{client_id}`. This
 * handler's job is therefore to proxy, not to query.
 *
 * **The proxy cannot be built here.** FastAPI authenticates with a Bearer
 * token and the BFF has no server-to-server channel to obtain one — the same
 * blocker as `[id]/generate-brief`, described in full there. Inventing a
 * channel would be an auth design decision, and calling the backend
 * unauthenticated would reopen exactly the hole this package is closing.
 *
 * So this returns **501** rather than a household. The client is resolved and
 * scoped first, so the route is correct the moment the channel exists.
 */

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession()
  if (!session.ok) return session.response

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: session.userId },
    select: { id: true },
  })

  if (!client) {
    // Deliberately identical to the response for a client in someone else's
    // book. On a route that would return a family's home addresses, "this
    // record exists but is not yours" is itself worth not disclosing.
    return NextResponse.json(
      { error_code: 'not_found', message: 'Client not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json(
    {
      available: false,
      error_code: 'not_implemented',
      message: 'Household data is not available through this endpoint yet.',
      detail:
        'Household composition lives in the FastAPI household_graph tables under D4, and the BFF has no authenticated server-to-server channel to reach them. This endpoint previously returned a hardcoded household including named family members and street addresses.',
    },
    { status: 501 }
  )
}
