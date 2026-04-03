"use client";

import { useState, useEffect } from "react";

const agents = [
  { name: "Scout", calls: 847, cost: "$892", avgLatency: "2.8s", model: "claude-opus-4-6", budget: "$1,200", budgetUsed: 74 },
  { name: "Analyst", calls: 523, cost: "$687", avgLatency: "4.2s", model: "claude-opus-4-6", budget: "$900", budgetUsed: 76 },
  { name: "Strategist", calls: 312, cost: "$445", avgLatency: "5.1s", model: "claude-opus-4-6", budget: "$600", budgetUsed: 74 },
  { name: "Copywriter", calls: 689, cost: "$198", avgLatency: "1.4s", model: "claude-sonnet-4-20250514", budget: "$300", budgetUsed: 66 },
  { name: "Compliance", calls: 234, cost: "$312", avgLatency: "3.5s", model: "claude-opus-4-6", budget: "$500", budgetUsed: 62 },
  { name: "Monitor", calls: 1245, cost: "$313", avgLatency: "0.8s", model: "claude-haiku-4-20250414", budget: "$400", budgetUsed: 78 },
];

const dailyCosts = [
  { day: "Mon", cost: 124 },
  { day: "Tue", cost: 156 },
  { day: "Wed", cost: 138 },
  { day: "Thu", cost: 167 },
  { day: "Fri", cost: 145 },
  { day: "Sat", cost: 52 },
  { day: "Sun", cost: 65 },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RuntimePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const totalCost = agents.reduce((a, ag) => a + parseFloat(ag.cost.replace("$", "").replace(",", "")), 0);
  const totalCalls = agents.reduce((a, ag) => a + ag.calls, 0);
  const maxDailyCost = Math.max(...dailyCosts.map((d) => d.cost));

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">AI Runtime</h1>
      <p className="text-chamber-400 mb-8">Monitor AI agent costs, latency, and budget utilization</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Total Cost (MTD)", `$${totalCost.toLocaleString()}`, "text-gold-400"],
          ["Total API Calls", totalCalls.toLocaleString(), "text-blue-400"],
          ["Avg Cost/Call", `$${(totalCost / totalCalls).toFixed(3)}`, "text-white"],
          ["Budget Utilization", "72%", "text-green-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Daily Cost Chart */}
      <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Cost (This Week)</h3>
        <div className="flex items-end gap-4 h-40">
          {dailyCosts.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-chamber-400">${d.cost}</span>
              <div className="w-full bg-gold-400/80 rounded-t" style={{ height: `${(d.cost / maxDailyCost) * 100}%` }} />
              <span className="text-xs text-chamber-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Breakdown */}
      <h3 className="text-lg font-semibold text-white mb-4">Cost by Agent</h3>
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Agent</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Model</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">API Calls</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Cost (MTD)</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Avg Latency</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Budget</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.name} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium">{a.name}</td>
                <td className="px-5 py-4 text-chamber-400 text-xs font-mono">{a.model}</td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{a.calls.toLocaleString()}</td>
                <td className="px-5 py-4 text-gold-400 font-medium">{a.cost}</td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{a.avgLatency}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-chamber-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${a.budgetUsed >= 80 ? "bg-red-400" : a.budgetUsed >= 60 ? "bg-gold-400" : "bg-green-400"}`} style={{ width: `${a.budgetUsed}%` }} />
                    </div>
                    <span className="text-xs text-chamber-400">{a.budgetUsed}% of {a.budget}</span>
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
