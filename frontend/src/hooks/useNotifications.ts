/**
 * Hook for fetching and managing notifications via the API.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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

  const markRead = useCallback(
    async (notificationId: string) => {
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
    },
    []
  );

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

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh: () => {
      fetchNotifications();
      fetchUnreadCount();
    },
  };
}
