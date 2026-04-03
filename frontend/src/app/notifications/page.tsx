"use client";

import { useState, useEffect } from "react";

const notifications = [
  { id: 1, type: "alert", title: "Pacific Trust payment overdue", desc: "Invoice INV-2026-040 is 5 days past due ($8,500)", time: "2 hours ago", read: false, tab: "Alerts" },
  { id: 2, type: "agent", title: "Scout completed market scan", desc: "Found 3 new emerging opportunities in luxury automotive", time: "4 hours ago", read: false, tab: "Agent Activity" },
  { id: 3, type: "alert", title: "Consent expiring — Sterling Capital", desc: "Data sharing consent expires in 7 days", time: "6 hours ago", read: false, tab: "Alerts" },
  { id: 4, type: "agent", title: "Analyst validated Aviation Concierge", desc: "4-point scorecard completed with 92/100", time: "8 hours ago", read: true, tab: "Agent Activity" },
  { id: 5, type: "system", title: "Background jobs service degraded", desc: "Latency increased to 150ms — monitoring", time: "10 hours ago", read: true, tab: "System" },
  { id: 6, type: "client", title: "Henderson meeting scheduled", desc: "Quarterly review confirmed for April 7 at 10:00 AM", time: "1 day ago", read: true, tab: "Client Updates" },
  { id: 7, type: "agent", title: "Copywriter generated outreach", desc: "2 new email templates ready for review", time: "1 day ago", read: true, tab: "Agent Activity" },
  { id: 8, type: "client", title: "Meridian Ventures support ticket", desc: "New ticket: API integration question", time: "1 day ago", read: false, tab: "Client Updates" },
  { id: 9, type: "system", title: "Monthly cost report generated", desc: "AI costs for March: $2,847 (within budget)", time: "2 days ago", read: true, tab: "System" },
  { id: 10, type: "alert", title: "Apex Family Office health declining", desc: "Health score dropped to 68 — engagement down", time: "2 days ago", read: true, tab: "Alerts" },
];

const tabs = ["All", "Alerts", "Agent Activity", "Client Updates", "System"];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [items, setItems] = useState(notifications);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = activeTab === "All" ? items : items.filter((n) => n.tab === activeTab);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "alert": return "bg-red-400/20 text-red-400";
      case "agent": return "bg-blue-400/20 text-blue-400";
      case "client": return "bg-green-400/20 text-green-400";
      case "system": return "bg-gold-400/20 text-gold-400";
      default: return "bg-chamber-700 text-chamber-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Notifications</h1>
          <p className="text-chamber-400">{unreadCount} unread notifications</p>
        </div>
        <button onClick={markAllRead} className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm">Mark all as read</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-chamber-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium transition border-b-2 whitespace-nowrap ${activeTab === tab ? "border-gold-400 text-gold-400" : "border-transparent text-chamber-400 hover:text-white"}`}>{tab}</button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.map((n) => (
          <div key={n.id} className={`p-4 rounded-xl border transition ${n.read ? "bg-chamber-900 border-chamber-800" : "bg-chamber-900 border-gold-400/20"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${typeIcon(n.type)}`}>
                {n.type === "alert" ? "!" : n.type === "agent" ? "AI" : n.type === "client" ? "C" : "S"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className={`font-medium ${n.read ? "text-chamber-300" : "text-white"}`}>{n.title}</h3>
                  {!n.read && <div className="w-2 h-2 bg-gold-400 rounded-full" />}
                </div>
                <p className="text-sm text-chamber-500">{n.desc}</p>
              </div>
              <span className="text-xs text-chamber-600 whitespace-nowrap">{n.time}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-chamber-500">No notifications in this category</div>
        )}
      </div>
    </div>
  );
}
