/**
 * NotificationToast — Toast popup in bottom-right for realtime notifications.
 * Auto-dismisses after 5 seconds. Click to navigate.
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Info, AlertTriangle, AlertOctagon, Siren } from "lucide-react";
import { clsx } from "clsx";

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
  crisis: Siren,
};

const TYPE_BG: Record<string, string> = {
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
  critical: "border-l-red-500",
  crisis: "border-l-red-700",
};

export interface ToastNotification {
  id: string;
  type: "info" | "warning" | "critical" | "crisis";
  title: string;
  body: string;
  action_url?: string;
}

interface NotificationToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onNavigate?: (url: string) => void;
}

function SingleToast({
  toast,
  onDismiss,
  onNavigate,
}: {
  toast: ToastNotification;
  onDismiss: (id: string) => void;
  onNavigate?: (url: string) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = TYPE_ICONS[toast.type] || Info;

  function handleClick() {
    if (toast.action_url && onNavigate) {
      onNavigate(toast.action_url);
    }
    onDismiss(toast.id);
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        "bg-white rounded-lg shadow-lg border-l-4 p-4 flex gap-3 cursor-pointer transition-all duration-300 max-w-sm",
        TYPE_BG[toast.type],
        exiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      )}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0 text-gray-600" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        <p className="text-xs text-gray-500 truncate">{toast.body}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        className="shrink-0 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function NotificationToast({
  toasts,
  onDismiss,
  onNavigate,
}: NotificationToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <SingleToast
          key={t.id}
          toast={t}
          onDismiss={onDismiss}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
