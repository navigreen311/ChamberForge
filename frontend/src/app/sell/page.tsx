"use client";

import { useState, useEffect } from "react";

const pipelineStages = [
  { stage: "Prospecting", count: 8, value: "$420K" },
  { stage: "Qualified", count: 5, value: "$680K" },
  { stage: "Proposal", count: 3, value: "$340K" },
  { stage: "Negotiation", count: 2, value: "$280K" },
  { stage: "Closed Won", count: 4, value: "$520K" },
];

const recentOutreach = [
  { client: "Apex Family Office", type: "Email", status: "Opened", sent: "2 hours ago" },
  { client: "Meridian Holdings", type: "LinkedIn", status: "Replied", sent: "1 day ago" },
  { client: "Vanguard Trust", type: "Email", status: "Sent", sent: "3 hours ago" },
];

const healthAlerts = [
  { client: "Pacific Trust", health: 42, issue: "Payment overdue — 5 days", severity: "critical" },
  { client: "Apex Family Office", health: 68, issue: "Engagement declining — 30-day trend", severity: "warning" },
  { client: "Sterling Capital", health: 91, issue: "Contract renewal in 14 days", severity: "info" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function SellPage() {
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
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Sell Hub</h1>
      <p className="text-chamber-400 mb-8">Pipeline management, outreach campaigns, and client health</p>

      {/* Pipeline */}
      <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Pipeline Overview</h3>
        <div className="flex gap-2">
          {pipelineStages.map((s, i) => (
            <div key={s.stage} className="flex-1 text-center">
              <div className={`h-16 rounded-lg flex items-center justify-center mb-2 ${i === pipelineStages.length - 1 ? "bg-green-400/20 border border-green-400/30" : "bg-gold-400/10 border border-gold-400/20"}`}>
                <div>
                  <p className="text-white font-bold">{s.count}</p>
                  <p className="text-xs text-chamber-400">{s.value}</p>
                </div>
              </div>
              <p className="text-xs text-chamber-400">{s.stage}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Outreach */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Outreach</h3>
            <a href="/sell/marketing" className="text-gold-400 text-sm hover:underline">Marketing &rarr;</a>
          </div>
          <div className="space-y-3">
            {recentOutreach.map((o) => (
              <div key={o.client} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium text-sm">{o.client}</p>
                  <p className="text-xs text-chamber-500">{o.type} &middot; {o.sent}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  o.status === "Replied" ? "bg-green-400/20 text-green-400" :
                  o.status === "Opened" ? "bg-blue-400/20 text-blue-400" :
                  "bg-chamber-700 text-chamber-400"
                }`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client Health Alerts */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Client Health Alerts</h3>
            <a href="/sell/retention" className="text-gold-400 text-sm hover:underline">Retention &rarr;</a>
          </div>
          <div className="space-y-3">
            {healthAlerts.map((a) => (
              <div key={a.client} className={`flex items-center justify-between p-3 rounded-lg border ${
                a.severity === "critical" ? "border-red-400/30 bg-red-400/5" :
                a.severity === "warning" ? "border-gold-400/30 bg-gold-400/5" :
                "border-blue-400/30 bg-blue-400/5"
              }`}>
                <div>
                  <p className="text-white font-medium text-sm">{a.client}</p>
                  <p className="text-xs text-chamber-500">{a.issue}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${a.health >= 80 ? "text-green-400" : a.health >= 60 ? "text-gold-400" : "text-red-400"}`}>{a.health}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Marketing Copy", "/sell/marketing"],
          ["Revenue Projector", "/sell/revenue"],
          ["Persona Simulator", "/sell/persona-sim"],
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
