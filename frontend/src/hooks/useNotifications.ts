/**
 * Hook for notifications — fetches from API on mount, then stays live via Pusher.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useUserEvents, useEvent } from "@/hooks/useRealtime";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Notification {
  id: string;
  user_id: string;
  workspace_id: string;
  type: "info" | "warning" | "critical" | "crisis";
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface UseNotificationsOptions {
  userId: string;
  typeFilter?: string;
  limit?: number;
}

export function useNotifications({
  userId,
  typeFilter,
  limit = 50,
}: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ---------- API fetchers ---------- */

  const fetchNotifications = useCallback(async () => {
    try {
      const params: Record<string, string> = {
        user_id: userId,
        limit: String(limit),
      };
      if (typeFilter) params.type = typeFilter;

      const resp = await axios.get(`${API_BASE}/api/v1/notifications/`, {
        params,
      });
      setNotifications(resp.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, typeFilter, limit]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const resp = await axios.get(`${API_BASE}/api/v1/notifications/count`, {
        params: { user_id: userId },
      });
      setUnreadCount(resp.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
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
    try {
      await axios.put(`${API_BASE}/api/v1/notifications/read-all`, null, {
        params: { user_id: userId },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, [userId]);

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
