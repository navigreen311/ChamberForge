"use client";

import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type NotificationType =
  | "wealth-event"
  | "sla"
  | "compliance"
  | "client-health"
  | "command-ai"
  | "system";

type FilterTab =
  | "All"
  | "Unread"
  | "Wealth Events"
  | "SLA & Compliance"
  | "Client Health"
  | "Command AI"
  | "System";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  entityLink: string;
  entityLabel: string;
}

// ---------------------------------------------------------------------------
// Inline data — 15 notifications
// ---------------------------------------------------------------------------
const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n01", type: "wealth-event", title: "Marcus Reid — Series C exit $120M", description: "Exit event detected for Marcus Reid's venture portfolio. Liquidity event may trigger rebalancing recommendations.", timestamp: "2h ago", read: false, entityLink: "/clients/marcus-reid", entityLabel: "Marcus Reid" },
  { id: "n02", type: "sla", title: "Wellington IR Plan overdue by 2 days", description: "Investment review plan for the Wellington Family Office has exceeded the 30-day SLA window.", timestamp: "3h ago", read: false, entityLink: "/compliance/sla/wellington", entityLabel: "Wellington SLA" },
  { id: "n03", type: "client-health", title: "Harrington Dynasty health score → 94 (+2)", description: "Client health score improved after recent engagement touchpoint and portfolio review completion.", timestamp: "4h ago", read: true, entityLink: "/clients/harrington-dynasty", entityLabel: "Harrington Dynasty" },
  { id: "n04", type: "command-ai", title: "New recommendation: Activate Cyber Command", description: "Command AI identified elevated cyber-risk exposure across 3 family offices. Recommends activating Cyber Command protocol.", timestamp: "5h ago", read: false, entityLink: "/playbooks/cyber-command", entityLabel: "Cyber Command" },
  { id: "n05", type: "compliance", title: "Guardrails flagged medical offer copy", description: "Compliance guardrails detected potentially non-compliant language in the medical concierge offer template.", timestamp: "6h ago", read: false, entityLink: "/compliance/guardrails/med-offer", entityLabel: "Guardrail Alert" },
  { id: "n06", type: "wealth-event", title: "Nakamura Trust — Real estate portfolio +$28M", description: "New appraisal data shows significant appreciation in the Nakamura Trust commercial real estate holdings.", timestamp: "7h ago", read: true, entityLink: "/clients/nakamura-trust", entityLabel: "Nakamura Trust" },
  { id: "n07", type: "sla", title: "Quarterly review deadline in 48 hours — Chen Group", description: "The Chen Group quarterly investment review is approaching its SLA deadline. 3 action items remain open.", timestamp: "8h ago", read: true, entityLink: "/compliance/sla/chen-group", entityLabel: "Chen Group SLA" },
  { id: "n08", type: "command-ai", title: "Portfolio drift detected: Ashworth Holdings", description: "Command AI detected a 4.2% drift from target allocation in the Ashworth Holdings equity sleeve.", timestamp: "10h ago", read: true, entityLink: "/clients/ashworth-holdings", entityLabel: "Ashworth Holdings" },
  { id: "n09", type: "client-health", title: "Patel Family Office health score → 71 (−5)", description: "Health score decline triggered by missed meeting and delayed document submission.", timestamp: "12h ago", read: false, entityLink: "/clients/patel-family", entityLabel: "Patel Family" },
  { id: "n10", type: "system", title: "Scheduled maintenance: April 5, 2:00 AM UTC", description: "Platform maintenance window scheduled. Expected downtime: 30 minutes. All client portals will be temporarily unavailable.", timestamp: "14h ago", read: true, entityLink: "/settings/maintenance", entityLabel: "Maintenance" },
  { id: "n11", type: "wealth-event", title: "DeLuca Estate — Art collection appraised at $45M", description: "Updated valuation received for the DeLuca Estate fine art collection. Previous valuation was $38M.", timestamp: "16h ago", read: true, entityLink: "/clients/deluca-estate", entityLabel: "DeLuca Estate" },
  { id: "n12", type: "compliance", title: "AML screening refresh completed — 0 flags", description: "Quarterly anti-money laundering screening completed across all active client accounts. No new flags.", timestamp: "18h ago", read: true, entityLink: "/compliance/aml-screening", entityLabel: "AML Screening" },
  { id: "n13", type: "command-ai", title: "Tax-loss harvesting window identified", description: "Command AI identified tax-loss harvesting opportunities in 4 client portfolios before quarter-end.", timestamp: "20h ago", read: true, entityLink: "/playbooks/tax-loss-harvest", entityLabel: "Tax-Loss Harvest" },
  { id: "n14", type: "client-health", title: "Montague Group NPS survey response received", description: "Montague Group submitted NPS score of 9. Positive sentiment noted in open-ended feedback.", timestamp: "1d ago", read: true, entityLink: "/clients/montague-group", entityLabel: "Montague Group" },
  { id: "n15", type: "system", title: "New feature: Enhanced compliance dashboard", description: "The compliance dashboard now includes real-time guardrail monitoring and automated SLA tracking.", timestamp: "1d ago", read: true, entityLink: "/settings/changelog", entityLabel: "Changelog" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string; bg: string; border: string }> = {
  "wealth-event": { icon: "💰", color: "text-yellow-400", bg: "bg-yellow-400/15", border: "border-yellow-400/30" },
  sla:            { icon: "⏱️", color: "text-red-400",    bg: "bg-red-400/15",    border: "border-red-400/30" },
  compliance:     { icon: "🛡️", color: "text-red-400",    bg: "bg-red-400/15",    border: "border-red-400/30" },
  "client-health":{ icon: "💚", color: "text-emerald-400",bg: "bg-emerald-400/15",border: "border-emerald-400/30" },
  "command-ai":   { icon: "🤖", color: "text-amber-400",  bg: "bg-amber-400/15",  border: "border-amber-400/30" },
  system:         { icon: "⚙️", color: "text-slate-400",  bg: "bg-slate-400/15",  border: "border-slate-400/30" },
};

const TABS: FilterTab[] = [
  "All",
  "Unread",
  "Wealth Events",
  "SLA & Compliance",
  "Client Health",
  "Command AI",
  "System",
];

function matchesTab(n: Notification, tab: FilterTab): boolean {
  switch (tab) {
    case "All":             return true;
    case "Unread":          return !n.read;
    case "Wealth Events":   return n.type === "wealth-event";
    case "SLA & Compliance":return n.type === "sla" || n.type === "compliance";
    case "Client Health":   return n.type === "client-health";
    case "Command AI":      return n.type === "command-ai";
    case "System":          return n.type === "system";
  }
}

function tabCount(notifications: Notification[], tab: FilterTab): number {
  return notifications.filter((n) => matchesTab(n, tab)).length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const filtered = useMemo(
    () => notifications.filter((n) => matchesTab(n, activeTab)),
    [notifications, activeTab],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  // --- Actions ---
  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const exportHistory = () => {
    const blob = new Blob(
      [JSON.stringify(notifications, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notifications-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateTo = (link: string) => {
    window.location.href = link;
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-1.5 text-sm rounded-lg border border-slate-700 text-slate-300 hover:border-amber-500/60 hover:text-amber-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark all read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="px-3.5 py-1.5 text-sm rounded-lg border border-slate-700 text-slate-300 hover:border-red-500/60 hover:text-red-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Clear all
          </button>
          <button
            onClick={exportHistory}
            disabled={notifications.length === 0}
            className="px-3.5 py-1.5 text-sm rounded-lg border border-slate-700 text-slate-300 hover:border-emerald-500/60 hover:text-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export history
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-800 overflow-x-auto pb-px scrollbar-none">
        {TABS.map((tab) => {
          const count = tabCount(notifications, tab);
          const isActive = activeTab === tab;
          const isUnread = tab === "Unread";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                isActive
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {tab}
              <span
                className={`inline-flex items-center justify-center text-xs rounded-full px-1.5 min-w-[20px] h-5 font-semibold ${
                  isUnread
                    ? "bg-amber-400/20 text-amber-400"
                    : isActive
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500 text-sm">
            No notifications in this category.
          </div>
        )}

        {filtered.map((n) => {
          const cfg = TYPE_CONFIG[n.type];
          return (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) markRead(n.id);
                navigateTo(n.entityLink);
              }}
              className={`group relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:bg-slate-800/40 ${
                n.read
                  ? "bg-[#0f1015] border-slate-800/60"
                  : "bg-[#0f1015] border-slate-800/60"
              }`}
            >
              {/* Unread gold left border */}
              {!n.read && (
                <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-amber-400" />
              )}

              {/* Type icon */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cfg.bg} border ${cfg.border}`}
              >
                {cfg.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${cfg.color}`}
                  >
                    {n.type.replace("-", " ").replace("command ai", "Command AI")}
                  </span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                  )}
                </div>
                <h3
                  className={`text-sm font-medium leading-snug ${
                    n.read ? "text-slate-300" : "text-white"
                  }`}
                >
                  {n.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {n.description}
                </p>
                <span className="inline-block mt-2 text-xs text-amber-400/70 group-hover:text-amber-400 transition">
                  → {n.entityLabel}
                </span>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-slate-600 whitespace-nowrap flex-shrink-0 pt-0.5">
                {n.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      {notifications.length > 0 && (
        <div className="mt-8 text-center text-xs text-slate-600">
          Showing {filtered.length} of {notifications.length} notifications
        </div>
      )}
    </div>
  );
}
