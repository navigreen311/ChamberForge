import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('next-auth.session-token')?.value ||
                request.cookies.get('__Secure-next-auth.session-token')?.value ||
                request.cookies.get('auth_token')?.value

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isPublic = pathname === '/' || pathname.startsWith('/portal') || pathname.startsWith('/api')

  // Allow public routes
  if (isPublic) return NextResponse.next()

  // Redirect logged-in users away from login
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow auth pages for non-logged-in users
  if (isAuthPage) return NextResponse.next()

  // For all other routes: allow through (auth checked client-side for now)
  // TODO: Enable strict server-side auth guard once NextAuth is fully wired
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|icons|manifest.json|sw.js|offline.html).*)']
}
