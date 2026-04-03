/**
 * Notifications page — full notification center with filter tabs and mark-all-read.
 */
"use client";

import { useState } from "react";
import { Info, AlertTriangle, AlertOctagon, Siren, CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";

const TABS = [
  { key: "all", label: "All", filter: undefined },
  { key: "unread", label: "Unread", filter: undefined },
  { key: "critical", label: "Critical", filter: "critical" },
] as const;

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
  crisis: Siren,
};

const TYPE_COLORS: Record<string, string> = {
  info: "text-blue-500 bg-blue-50",
  warning: "text-amber-500 bg-amber-50",
  critical: "text-red-500 bg-red-50",
  crisis: "text-red-700 bg-red-50",
};

// In production, userId comes from auth context. Hardcoded for dev.
const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "critical">("all");

  const typeFilter = activeTab === "critical" ? "critical" : undefined;
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
  } = useNotifications({
    userId: DEV_USER_ID,
    typeFilter,
    limit: 100,
  });

  const displayed =
    activeTab === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No notifications to show
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((n) => (
            <NotificationRow key={n.id} notification={n} onMarkRead={markRead} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  notification: n,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const Icon = TYPE_ICONS[n.type] || Info;
  const colorClass = TYPE_COLORS[n.type] || TYPE_COLORS.info;

  return (
    <div
      className={clsx(
        "flex gap-4 p-4 rounded-lg border transition-colors",
        n.is_read ? "bg-white border-gray-100" : "bg-blue-50/30 border-blue-100"
      )}
    >
      <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={clsx("text-sm", n.is_read ? "text-gray-700" : "font-semibold text-gray-900")}>
            {n.title}
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{n.body}</p>
        {n.action_url && (
          <a
            href={n.action_url}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            View details
          </a>
        )}
      </div>
      {!n.is_read && (
        <button
          onClick={() => onMarkRead(n.id)}
          className="text-xs text-gray-400 hover:text-gray-600 shrink-0 self-center"
          title="Mark as read"
        >
          <CheckCheck className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
