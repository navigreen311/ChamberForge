import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Route guard for the Next.js surface.
 *
 * P-11 resolved the TODO this carried:
 *
 *     // For all other routes: allow through (auth checked client-side for now)
 *     // TODO: Enable strict server-side auth guard once NextAuth is fully wired
 *
 * Every protected page fell through that line, so the only thing standing
 * between an anonymous visitor and the operator console was whatever each
 * page happened to check on the client — which is not a control, because the
 * client is the thing being asked.
 *
 * Two changes:
 *
 * 1. **Unauthenticated requests to a protected page redirect to /login**,
 *    carrying the original path so sign-in returns the operator where they
 *    were going.
 *
 * 2. **`/api` is no longer blanket-exempt.** It used to be listed as public,
 *    which made all 78 BFF route handlers anonymous by default. They now get
 *    a cheap cookie check here and a real identity check in the handler via
 *    `requireSession()`.
 *
 * On the division of labour: this middleware runs on the edge runtime and
 * cannot open a Prisma connection, so it can confirm a session cookie is
 * *present* but not that it maps to a live operator. That is why it is a
 * cheap first pass and `requireSession()` in the handler is the real gate —
 * not belt-and-braces, but two checks that can each do what the other
 * cannot.
 */

// Pages reachable without a session.
const PUBLIC_PAGES = ['/login', '/register', '/']

// Prefixes that are public in full. The portal authenticates by single-use
// magic-link token rather than session (P-30 owns and asserts those rules),
// so it is not "unprotected" — it has a different scheme.
const PUBLIC_PREFIXES = ['/portal']

// NextAuth's own endpoints must stay reachable, or sign-in cannot happen.
const AUTH_API_PREFIX = '/api/auth'

function sessionCookie(request: NextRequest): string | undefined {
  return (
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = sessionCookie(request)

  // NextAuth's endpoints: always through.
  if (pathname.startsWith(AUTH_API_PREFIX)) return NextResponse.next()

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Signed in and heading for the sign-in page: send them to work instead.
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if (PUBLIC_PAGES.includes(pathname)) return NextResponse.next()

  // BFF route handlers. A missing cookie is answered with 401 JSON rather
  // than an HTML redirect, because the caller is fetch(), not a browser
  // following links. The handler's requireSession() is what actually
  // verifies the operator.
  if (pathname.startsWith('/api')) {
    if (!token) {
      return NextResponse.json(
        { error_code: 'not_authenticated', message: 'Authentication required.' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // Everything else is an operator page.
  if (!token) {
    const login = new URL('/login', request.url)
    // Return them where they were going after sign-in.
    login.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|public|icons|manifest.json|sw.js|offline.html).*)',
  ],
}
