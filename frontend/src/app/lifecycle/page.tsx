"use client";

import { useState, useEffect } from "react";

const upcomingMeetings = [
  { client: "Henderson Family Office", type: "Quarterly Review", date: "2026-04-07", time: "10:00 AM" },
  { client: "Sterling Capital Group", type: "Contract Renewal", date: "2026-04-10", time: "2:00 PM" },
  { client: "Meridian Ventures", type: "Service Recovery", date: "2026-04-05", time: "11:00 AM" },
];

const healthAlerts = [
  { client: "Pacific Trust", health: 42, alert: "Payment overdue 5 days — escalate immediately", severity: "critical" },
  { client: "Apex Family Office", health: 68, alert: "Engagement declining for 30 days", severity: "warning" },
  { client: "Meridian Ventures", health: 78, alert: "Unresolved support ticket — SLA at risk", severity: "warning" },
];

const trainingModules = [
  { name: "UHNW Client Communication", progress: 100, status: "Completed" },
  { name: "Data Privacy & GDPR", progress: 75, status: "In Progress" },
  { name: "Premium Service Delivery", progress: 40, status: "In Progress" },
  { name: "Crisis Management Protocol", progress: 0, status: "Not Started" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function LifecyclePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Lifecycle Hub</h1>
      <p className="text-chamber-400 mb-8">Client meetings, health monitoring, and team training</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Meetings */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Meetings</h3>
          <div className="space-y-3">
            {upcomingMeetings.map((m) => (
              <div key={m.client + m.type} className="p-3 bg-chamber-800/50 rounded-lg">
                <p className="text-white font-medium text-sm">{m.client}</p>
                <p className="text-xs text-chamber-500">{m.type}</p>
                <p className="text-xs text-gold-400 mt-1">{m.date} at {m.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health Alerts */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Health Alerts</h3>
            <a href="/lifecycle/health" className="text-gold-400 text-sm hover:underline">View all &rarr;</a>
          </div>
          <div className="space-y-3">
            {healthAlerts.map((a) => (
              <div key={a.client} className={`p-3 rounded-lg border ${a.severity === "critical" ? "border-red-400/30 bg-red-400/5" : "border-gold-400/30 bg-gold-400/5"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium text-sm">{a.client}</p>
                  <span className={`text-sm font-bold ${a.health >= 60 ? "text-gold-400" : "text-red-400"}`}>{a.health}</span>
                </div>
                <p className="text-xs text-chamber-400">{a.alert}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Training */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Training Modules</h3>
          <div className="space-y-4">
            {trainingModules.map((t) => (
              <div key={t.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-chamber-300">{t.name}</span>
                  <span className={`text-xs ${t.status === "Completed" ? "text-green-400" : t.status === "In Progress" ? "text-gold-400" : "text-chamber-500"}`}>{t.status}</span>
                </div>
                <div className="w-full h-2 bg-chamber-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${t.progress === 100 ? "bg-green-400" : t.progress > 0 ? "bg-gold-400" : "bg-chamber-700"}`} style={{ width: `${t.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Intel Briefs", "/lifecycle/intel-brief/client-001"],
          ["Health Monitor", "/lifecycle/health"],
          ["Scenario Planner", "/lifecycle/scenario"],
          ["Client Retention", "/sell/retention"],
        ].map(([name, href]) => (
          <a key={String(name)} href={String(href)} className="bg-chamber-900 rounded-xl p-4 border border-chamber-800 hover:border-gold-400/50 transition text-center">
            <p className="text-white font-medium">{String(name)}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
