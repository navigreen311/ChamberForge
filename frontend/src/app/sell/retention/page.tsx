"use client";

import { useState, useEffect } from "react";

const clients = [
  { name: "Henderson Family Office", health: 96, trend: "stable", mrr: "$22,000", lastContact: "2 days ago", nps: 9, riskFactors: [] },
  { name: "Sterling Capital Group", health: 91, trend: "up", mrr: "$22,000", lastContact: "1 day ago", nps: 9, riskFactors: ["Contract renewal in 14 days"] },
  { name: "Blackwell Holdings", health: 85, trend: "stable", mrr: "$12,500", lastContact: "5 days ago", nps: 8, riskFactors: [] },
  { name: "Meridian Ventures", health: 78, trend: "down", mrr: "$12,500", lastContact: "12 days ago", nps: 7, riskFactors: ["Engagement declining", "Support ticket unresolved"] },
  { name: "Apex Family Office", health: 68, trend: "down", mrr: "$8,500", lastContact: "18 days ago", nps: 6, riskFactors: ["Low engagement", "Missed last 2 meetings"] },
  { name: "Pacific Trust", health: 42, trend: "down", mrr: "$8,500", lastContact: "25 days ago", nps: 4, riskFactors: ["Payment overdue", "No response to outreach", "Service complaints"] },
  { name: "Vanguard Family Trust", health: 88, trend: "up", mrr: "$12,500", lastContact: "3 days ago", nps: 8, riskFactors: [] },
  { name: "Crown Estate Partners", health: 82, trend: "stable", mrr: "$22,000", lastContact: "4 days ago", nps: 8, riskFactors: [] },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const healthColor = (h: number) => h >= 80 ? "text-green-400" : h >= 60 ? "text-gold-400" : "text-red-400";
  const healthBg = (h: number) => h >= 80 ? "bg-green-400" : h >= 60 ? "bg-gold-400" : "bg-red-400";

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Client Retention</h1>
      <p className="text-chamber-400 mb-8">Monitor client health and proactively address churn risk</p>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Avg Health", "80", healthColor(80)],
          ["At Risk", clients.filter(c => c.health < 70).length.toString(), "text-red-400"],
          ["Healthy", clients.filter(c => c.health >= 80).length.toString(), "text-green-400"],
          ["Avg NPS", (clients.reduce((a, c) => a + c.nps, 0) / clients.length).toFixed(1), "text-gold-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Client Health Table */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Health</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Trend</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">MRR</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Last Contact</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">NPS</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Risk Factors</th>
            </tr>
          </thead>
          <tbody>
            {clients.sort((a, b) => a.health - b.health).map((c) => (
              <tr key={c.name} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium">{c.name}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-chamber-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${healthBg(c.health)}`} style={{ width: `${c.health}%` }} />
                    </div>
                    <span className={`text-sm font-bold ${healthColor(c.health)}`}>{c.health}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm ${c.trend === "up" ? "text-green-400" : c.trend === "down" ? "text-red-400" : "text-chamber-400"}`}>
                    {c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→"} {c.trend}
                  </span>
                </td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{c.mrr}</td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{c.lastContact}</td>
                <td className="px-5 py-4">
                  <span className={`font-medium ${c.nps >= 8 ? "text-green-400" : c.nps >= 6 ? "text-gold-400" : "text-red-400"}`}>{c.nps}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {c.riskFactors.length === 0 ? (
                      <span className="text-xs text-chamber-600">None</span>
                    ) : c.riskFactors.map((r) => (
                      <span key={r} className="px-1.5 py-0.5 bg-red-400/10 text-red-400 text-xs rounded">{r}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
