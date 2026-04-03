/**
 * Hook for notifications — fetches from API on mount, then stays live via Pusher.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useUserEvents, useEvent } from "@/hooks/useRealtime";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  body?: string;
  action_url?: string;
  [key: string]: unknown;
}

// ─── useNotifications ───────────────────────────────────────────────────────

export interface UseNotificationsOptions {
  typeFilter?: string;
  limit?: number;
  userId?: string | null;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const { typeFilter, limit = 50, userId = null } = options ?? {};

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- API fetchers ---------- */

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { limit };
      if (typeFilter) params.type = typeFilter;

      const { data } = await api.get("/api/v1/notifications", { params });
      const items: Notification[] = Array.isArray(data)
        ? data
        : data.items ?? [];
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.is_read).length);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [typeFilter, limit]);

  /* ---------- Mutations ---------- */

  const markRead = useCallback(async (notificationId: string) => {
    setError(null);
    try {
      await api.put(`/api/v1/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to mark notification as read"
      );
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setError(null);
    try {
      await api.put("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to mark all as read"
      );
    }
  }, []);

  /* ---------- Initial fetch ---------- */

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ---------- Realtime: subscribe to user channel ---------- */

  const userChannel = useUserEvents(userId);

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
    error,
    markRead,
    markAllRead,
    incrementUnread,
    refresh: fetchNotifications,
  };
}
