import { getServerSession } from 'next-auth/next'
import { NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'

/**
 * The guard every BFF route handler calls.
 *
 * P-11 publishes this and **the interface is frozen** — P-19 through P-23
 * implement 78 handlers against it, so a signature change here is a change
 * in five packages at once.
 *
 * Why it exists: `middleware.ts` exempted `/api` from its matcher and then
 * allowed everything else through behind a TODO, so every route handler was
 * anonymous by default. Middleware alone cannot fix that — a Next.js
 * middleware runs on the edge runtime and cannot open a Prisma connection,
 * so it can confirm a cookie exists but not that it maps to a real operator.
 * The handler is where that check belongs.
 *
 * Usage:
 *
 *   export async function GET() {
 *     const session = await requireSession()
 *     if (!session.ok) return session.response
 *     const rows = await prisma.client.findMany({
 *       where: { userId: session.userId },
 *     })
 *     return NextResponse.json(rows)
 *   }
 *
 * The `session.ok` check is not ceremony. Returning the operator id as part
 * of a discriminated union means TypeScript will not let a handler read
 * `userId` without first handling the unauthenticated branch, so "I forgot
 * to check" becomes a compile error rather than a data leak.
 */

export type SessionOk = {
  ok: true
  /** The operator. Scope every Prisma query in the handler by this. */
  userId: string
  email: string | null
  role: string
  mode: string
}

export type SessionFailed = {
  ok: false
  /** Return this straight from the handler. */
  response: NextResponse
}

export type RequireSessionResult = SessionOk | SessionFailed

function unauthorized(): SessionFailed {
  return {
    ok: false,
    response: NextResponse.json(
      {
        error_code: 'not_authenticated',
        message: 'Authentication required.',
      },
      { status: 401 }
    ),
  }
}

function forbidden(message: string): SessionFailed {
  return {
    ok: false,
    response: NextResponse.json(
      { error_code: 'forbidden', message },
      { status: 403 }
    ),
  }
}

/**
 * Resolve the operator for this request, or produce the response to return.
 *
 * Never throws: a handler that forgets a try/catch should still fail closed
 * with a 401 rather than a 500 that leaks a stack trace.
 */
export async function requireSession(): Promise<RequireSessionResult> {
  let session
  try {
    session = await getServerSession(authOptions)
  } catch {
    // A misconfigured secret or an unreachable database must not read as
    // "authenticated". Fail closed.
    return unauthorized()
  }

  const user = session?.user as Record<string, unknown> | undefined
  const userId = typeof user?.id === 'string' ? user.id : null

  if (!userId) return unauthorized()

  return {
    ok: true,
    userId,
    email: typeof user?.email === 'string' ? user.email : null,
    role: typeof user?.role === 'string' ? user.role : 'operator',
    mode: typeof user?.mode === 'string' ? user.mode : 'expert',
  }
}

/**
 * As `requireSession`, but also requires one of *roles*.
 *
 * For the admin surface. P-16 gates the FastAPI side with
 * `require_role("admin")`; this is the equivalent for BFF handlers, so the
 * two stacks refuse the same person for the same reason.
 */
export async function requireRole(
  ...roles: string[]
): Promise<RequireSessionResult> {
  const result = await requireSession()
  if (!result.ok) return result
  if (!roles.includes(result.role)) {
    return forbidden('This action requires one of: ' + roles.join(', '))
  }
  return result
}
