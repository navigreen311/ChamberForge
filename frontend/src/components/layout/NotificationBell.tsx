/**
 * NotificationBell — Bell icon with unread badge and dropdown of recent notifications.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Info, AlertTriangle, AlertOctagon, Siren } from "lucide-react";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import type { Channel } from "pusher-js";
import type { Notification } from "@/hooks/useNotifications";
import { useEvent } from "@/hooks/useRealtime";

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
  crisis: Siren,
};

const TYPE_COLORS: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-amber-500",
  critical: "text-red-500",
  crisis: "text-red-700",
};

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate?: (url: string) => void;
  /** Optional Pusher channel — when provided, new-notification events bump the badge */
  realtimeChannel?: Channel | null;
}

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  realtimeChannel,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [realtimeBump, setRealtimeBump] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Bump badge count on realtime event without an API call
  useEvent<Notification>(realtimeChannel ?? null, "new-notification", () => {
    setRealtimeBump((c) => c + 1);
  });

  // Reset bump when unreadCount changes from parent (e.g. after markAllRead)
  useEffect(() => {
    setRealtimeBump(0);
  }, [unreadCount]);

  const displayCount = unreadCount + realtimeBump;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleItemClick(n: Notification) {
    if (!n.is_read) onMarkRead(n.id);
    if (n.action_url && onNavigate) onNavigate(n.action_url);
    setOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {displayCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[480px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {displayCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const Icon = TYPE_ICONS[n.type] || Info;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={clsx(
                      "w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50",
                      !n.is_read && "bg-blue-50/50"
                    )}
                  >
                    <Icon className={clsx("w-5 h-5 mt-0.5 shrink-0", TYPE_COLORS[n.type])} />
                    <div className="flex-1 min-w-0">
                      <p className={clsx("text-sm", !n.is_read ? "font-semibold text-gray-900" : "text-gray-700")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{n.body}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2">
            <a
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 block text-center"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
