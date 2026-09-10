'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useCallback } from 'react';

import api from '@/lib/api';
import type { RegisterRequest, User } from '@/types';

/**
 * The operator's session.
 *
 * P-11 moved this onto NextAuth. It previously kept the access token, the
 * refresh token and the whole user object in `localStorage`, and mirrored
 * the token into a non-httpOnly `auth_token` cookie - which meant any XSS
 * anywhere on the origin was a full session compromise, on a platform
 * holding HNW client data.
 *
 * NextAuth's JWT strategy keeps the session in an httpOnly cookie that
 * script cannot read. The token is never handed to the client, so there is
 * nothing on this side to steal.
 *
 * The returned shape is unchanged, because ~20 components destructure it.
 */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const sessionUser = session?.user as Record<string, unknown> | undefined;

  const state: AuthState = {
    user: sessionUser
      ? ({
          id: sessionUser.id as string,
          email: sessionUser.email as string,
          name: sessionUser.name as string,
          role: (sessionUser.role as string) ?? 'operator',
        } as User)
      : null,
    isAuthenticated: status === 'authenticated',
    isAdmin: (sessionUser?.role as string) === 'admin',
    isLoading: status === 'loading',
  };

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (!result || result.error) {
      throw new Error('Invalid email or password');
    }
    return result;
  }, []);

  /**
   * Registration still goes through the FastAPI endpoint, which creates the
   * workspace alongside the user. Which stack should own sign-up is an open
   * question recorded in PARALLEL_BUILD_ESCALATION.md - guessing would put
   * new operators in a table the console cannot see. Signing in afterwards
   * goes through NextAuth, so the session is a real one either way.
   */
  const register = useCallback(
    async (payload: RegisterRequest) => {
      await api.post('/api/v1/auth/register', payload);
      await signIn('credentials', {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/login' });
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
  };
}
