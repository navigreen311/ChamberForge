/**
 * Hook for notifications — fetches from API on mount, then stays live via Pusher.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useUserEvents, useEvent } from "@/hooks/useRealtime";

// ─── useNotifications ───────────────────────────────────────────────────────

export interface UseNotificationsOptions {
  typeFilter?: string
  limit?: number
}

export function useNotifications(options?: UseNotificationsOptions) {
  const { typeFilter, limit = 50 } = options ?? {}

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ---------- API fetchers ---------- */

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { limit }
      if (typeFilter) params.type = typeFilter

      const { data } = await api.get('/api/v1/notifications', { params })
      const items = Array.isArray(data) ? data : data.items ?? []
      setNotifications(items)
      setUnreadCount(items.filter((n: Notification) => !n.is_read).length)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [typeFilter, limit])

  const markRead = useCallback(async (id: string) => {
    setError(null)
    try {
      await api.put(`/api/v1/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark notification as read')
    }
  }, [userId]);

  /* ---------- Mutations ---------- */

  const markRead = useCallback(async (notificationId: string) => {
    try {
      await axios.put(
        `${API_BASE}/api/v1/notifications/${notificationId}/read`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setError(null)
    try {
      await api.put('/api/v1/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark all as read')
    }
  }, [])

  /* ---------- Initial fetch ---------- */

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  /* ---------- Realtime: subscribe to user channel ---------- */

  const userChannel = useUserEvents(userId || null);

  // new-notification event — prepend to list, bump unread count
  useEvent<Notification>(userChannel, "new-notification", (data) => {
    setNotifications((prev) => [data, ...prev].slice(0, limit));
    if (!data.is_read) {
      setUnreadCount((c) => c + 1);
    }
  });

  // notification-read event — mark single notification as read
  useEvent<{ id: string }>(userChannel, "notification-read", (data) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === data.id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  });

  /* ---------- Public incrementUnread for external callers ---------- */

  const incrementUnread = useCallback(() => {
    setUnreadCount((c) => c + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    incrementUnread,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    },
  };
}
