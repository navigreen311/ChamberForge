import { create } from 'zustand';
import api from '@/lib/api';
import type { Notification, PaginatedResponse } from '@/types';

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<PaginatedResponse<Notification>>(
        '/api/v1/notifications',
      );
      set({ notifications: data.items });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch notifications';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get<{ count: number }>(
        '/api/v1/notifications/unread-count',
      );
      set({ unreadCount: data.count });
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to fetch unread count';
      set({ error: message });
    }
  },

  markRead: async (id: string) => {
    try {
      await api.patch(`/api/v1/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to mark notification as read';
      set({ error: message });
      throw err;
    }
  },

  markAllRead: async () => {
    try {
      await api.patch('/api/v1/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
        unreadCount: 0,
      }));
    } catch (err: any) {
      const message =
        err.response?.data?.detail || 'Failed to mark all as read';
      set({ error: message });
      throw err;
    }
  },
}));
