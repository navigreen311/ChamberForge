import { create } from 'zustand';
import api from '@/lib/api';
import type { User, AuthTokens, LoginRequest, RegisterRequest } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<AuthTokens>('/api/v1/auth/login', {
        email,
        password,
      } satisfies LoginRequest);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      set({ token: data.access_token, isAuthenticated: true });
      await get().fetchMe();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed';
      set({ error: message, isAuthenticated: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const { data: tokens } = await api.post<AuthTokens>(
        '/api/v1/auth/register',
        data,
      );
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      document.cookie = `auth_token=${tokens.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      set({ token: tokens.access_token, isAuthenticated: true });
      await get().fetchMe();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registration failed';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get<User>('/api/v1/auth/me');
      set({ user: data, isAuthenticated: true });
    } catch (err: any) {
      set({ user: null, isAuthenticated: false });
      throw err;
    }
  },

  hydrate: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    if (!token) return;
    set({ token, isLoading: true });
    try {
      await get().fetchMe();
    } catch {
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));
