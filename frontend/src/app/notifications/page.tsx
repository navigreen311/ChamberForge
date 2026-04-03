"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  read: boolean;
}

const tabs = ["All", "Unread", "Critical"] as const;
type Tab = (typeof tabs)[number];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const fetchNotifications = useCallback(async (tab: Tab) => {
    try {
      setError(null);
      const params: Record<string, string> = {};
      if (tab === "Unread") params.unread = "true";
      if (tab === "Critical") params.type = "critical";
      const res = await api.get("/api/v1/notifications", { params });
      setNotifications(res.data?.notifications ?? res.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNotifications(activeTab);
  }, [activeTab, fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcon = (type: string) => {
    switch (type) {
      case "alert":
      case "critical":
        return "bg-red-400/20 text-red-400";
      case "agent":
        return "bg-blue-400/20 text-blue-400";
      case "client":
        return "bg-green-400/20 text-green-400";
      case "system":
        return "bg-gold-400/20 text-gold-400";
      default:
        return "bg-chamber-700 text-chamber-400";
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "alert":
      case "critical":
        return "!";
      case "agent":
        return "AI";
      case "client":
        return "C";
      case "system":
        return "S";
      default:
        return "N";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">
            Notifications
          </h1>
          <p className="text-chamber-400">{unreadCount} unread notifications</p>
        </div>
        <button
          onClick={markAllRead}
          className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm"
        >
          Mark all as read
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 flex items-center justify-between">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => fetchNotifications(activeTab)}
            className="text-sm text-red-300 underline hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-chamber-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-chamber-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              n.read
                ? "bg-chamber-900 border-chamber-800"
                : "bg-chamber-900 border-gold-400/20"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${typeIcon(n.type)}`}
              >
                {typeLabel(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3
                    className={`font-medium ${n.read ? "text-chamber-300" : "text-white"}`}
                  >
                    {n.title}
                  </h3>
                  {!n.read && (
                    <div className="w-2 h-2 bg-gold-400 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-chamber-500">{n.description}</p>
              </div>
              <span className="text-xs text-chamber-600 whitespace-nowrap">
                {n.created_at ? timeAgo(n.created_at) : ""}
              </span>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-16 text-chamber-500">
            No notifications in this category
          </div>
        )}
      </div>
    </div>
  );
}
