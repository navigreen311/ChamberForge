import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

import { prisma } from '@/lib/prisma'

/**
 * NextAuth configuration, extracted by P-11.
 *
 * This was inline in `app/api/auth/[...nextauth]/route.ts`, which meant
 * `getServerSession()` had nothing to import and every server-side guard had
 * to re-declare the config or go without. Extracting it is what makes a
 * single source of truth for "who is this request" possible on the server.
 *
 * The provider setup is Phase 3 Section 1's and is deliberately unchanged —
 * D1 says build on it, not rewrite it. What P-11 adds is the `role` and
 * `mode` claims surviving into the session, and the operator id being
 * readable as `session.user.id`.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as never,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user?.password) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        return valid ? user : null
      },
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  // JWT strategy means the session lives in an httpOnly cookie that NextAuth
  // sets and reads. That is why the audit's "JWT in localStorage" finding is
  // resolved by architecture on this path rather than by a migration.
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // The operator id. Every BFF handler scopes its Prisma queries by
        // this, so it has to be present rather than inferred from the email.
        if (token.sub) (session.user as Record<string, unknown>).id = token.sub
        if (token.role) (session.user as Record<string, unknown>).role = token.role
        if (token.mode) (session.user as Record<string, unknown>).mode = token.mode
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>
        token.role = u.role
        token.mode = u.mode
      }
      return token
    },
  },
}
