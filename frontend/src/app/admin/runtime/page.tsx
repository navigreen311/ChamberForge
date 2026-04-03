"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface AgentUsage {
  agent: string;
  model: string;
  calls: number;
  cost: number;
  avg_latency_ms: number;
  budget?: number;
  budget_used_pct?: number;
}

interface RuntimeUsage {
  agents: AgentUsage[];
  total_cost: number;
  total_calls: number;
  daily_costs?: { day: string; cost: number }[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RuntimePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<RuntimeUsage | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await api.get("/api/v1/primitives/runtime/usage");
        setUsage(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load runtime usage");
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

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

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
        <h1 className="text-3xl font-display font-bold text-white mb-4">AI Runtime</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  const totalCost = usage?.total_cost ?? 0;
  const totalCalls = usage?.total_calls ?? 0;
  const agents = usage?.agents ?? [];
  const dailyCosts = usage?.daily_costs ?? [];
  const maxDailyCost = dailyCosts.length > 0 ? Math.max(...dailyCosts.map((d) => d.cost)) : 1;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">AI Runtime</h1>
      <p className="text-chamber-400 mb-8">Monitor AI agent costs, latency, and budget utilization</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Total Cost", `$${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "text-gold-400"],
          ["Total API Calls", totalCalls.toLocaleString(), "text-blue-400"],
          ["Avg Cost/Call", totalCalls > 0 ? `$${(totalCost / totalCalls).toFixed(3)}` : "--", "text-white"],
          ["Agents Tracked", agents.length.toString(), "text-green-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Daily Cost Chart */}
      {dailyCosts.length > 0 && (
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Cost</h3>
          <div className="flex items-end gap-4 h-40">
            {dailyCosts.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-chamber-400">${d.cost.toFixed(0)}</span>
                <div className="w-full bg-gold-400/80 rounded-t" style={{ height: `${(d.cost / maxDailyCost) * 100}%` }} />
                <span className="text-xs text-chamber-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Breakdown */}
      <h3 className="text-lg font-semibold text-white mb-4">Cost by Agent</h3>
      {agents.length === 0 ? (
        <div className="bg-chamber-900 rounded-xl p-8 border border-chamber-800 text-center text-chamber-500">No agent usage data found.</div>
      ) : (
        <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-chamber-800">
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Agent</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Model</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">API Calls</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Cost</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Avg Latency</th>
                {agents.some(a => a.budget_used_pct != null) && (
                  <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Budget</th>
                )}
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.agent} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-5 py-4 text-white font-medium">{a.agent}</td>
                  <td className="px-5 py-4 text-chamber-400 text-xs font-mono">{a.model}</td>
                  <td className="px-5 py-4 text-chamber-300 text-sm">{a.calls.toLocaleString()}</td>
                  <td className="px-5 py-4 text-gold-400 font-medium">${a.cost.toFixed(2)}</td>
                  <td className="px-5 py-4 text-chamber-300 text-sm">{a.avg_latency_ms}ms</td>
                  {a.budget_used_pct != null && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-chamber-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${a.budget_used_pct >= 80 ? "bg-red-400" : a.budget_used_pct >= 60 ? "bg-gold-400" : "bg-green-400"}`} style={{ width: `${a.budget_used_pct}%` }} />
                        </div>
                        <span className="text-xs text-chamber-400">{a.budget_used_pct}%</span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
