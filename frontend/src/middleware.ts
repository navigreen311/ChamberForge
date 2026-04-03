import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js edge middleware — redirect unauthenticated users to /login.
 * Public paths (/login, /register, static assets, API routes) are exempted.
 */

const PUBLIC_PATHS = ["/login", "/register"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  // Allow Next.js internals and static files
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.includes(".")) return true; // static assets (favicon, etc.)
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token in cookie or Authorization header
  const tokenCookie = request.cookies.get("auth_token")?.value;
  const tokenHeader = request.headers.get("Authorization");

  if (!tokenCookie && !tokenHeader) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
