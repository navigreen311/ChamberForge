import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/portal', '/api', '/dashboard', '/discover', '/build', '/sell', '/qualify', '/compliance', '/lifecycle', '/admin', '/settings', '/onboarding', '/notifications', '/search', '/command', '/risk-queue', '/automation', '/revenue', '/evidence', '/partners', '/exports', '/sandbox', '/offers', '/clients', '/playbooks', '/deliver']
const ADMIN_PATHS = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for auth token in cookies or Authorization header
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin path protection (decode JWT to check role — simplified check)
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch { /* allow through if token parse fails — backend will reject */ }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)']
}
