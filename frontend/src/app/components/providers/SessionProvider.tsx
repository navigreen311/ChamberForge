'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import React from 'react'

/**
 * Thin wrapper so the app mounts NextAuth's provider through one named
 * component rather than importing from `next-auth/react` in the layout.
 *
 * P-11. Before this, nothing in the app imported `useSession`,
 * `getServerSession` or `SessionProvider` at all — NextAuth was configured
 * and then consumed by nobody, so `useAuth()` read `localStorage` and the
 * session it issued went unused.
 */
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
