import NextAuth from 'next-auth'

import { authOptions } from '@/lib/auth'

/**
 * P-11 extracted the configuration to `@/lib/auth` so `getServerSession()`
 * can share it. The provider setup itself is Phase 3 Section 1's and is
 * unchanged - D1 says build on it, not rewrite it.
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
