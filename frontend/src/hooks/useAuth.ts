'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { User, AuthTokens, LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token) {
      try {
        const user: User = JSON.parse(stored);
        setState({
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isLoading: false,
        });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const payload: LoginRequest = { email, password };
    const { data } = await api.post<AuthTokens & { user: User }>(
      '/api/v1/auth/login',
      payload,
    );

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setState({
      user: data.user,
      isAuthenticated: true,
      isAdmin: data.user.role === 'admin',
      isLoading: false,
    });

    return data.user;
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const { data } = await api.post<AuthTokens & { user: User }>(
      '/api/v1/auth/register',
      payload,
    );

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    setState({
      user: data.user,
      isAuthenticated: true,
      isAdmin: data.user.role === 'admin',
      isLoading: false,
    });

    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    setState({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    });

    window.location.href = '/login';
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
  };
}
