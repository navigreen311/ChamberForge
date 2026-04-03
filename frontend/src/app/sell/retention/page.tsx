"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useWorkspaceEvents, useEvent } from "@/hooks/useRealtime";

const WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || null;

interface Client {
  name: string;
  health: number;
  trend: string;
  mrr: string;
  lastContact: string;
  last_contact?: string;
  nps: number;
  riskFactors: string[];
  risk_factors?: string[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function fetchHealthScores() {
      try {
        const res = await api.get("/api/v1/sell/retention/health-scores");
        const data = res.data?.clients ?? res.data?.health_scores ?? res.data ?? [];
        // Normalize field names
        setClients(data.map((c: any) => ({
          ...c,
          lastContact: c.lastContact ?? c.last_contact ?? "N/A",
          riskFactors: c.riskFactors ?? c.risk_factors ?? [],
        })));
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to load health scores");
      } finally {
        setLoading(false);
      }
    }
    fetchHealthScores();
  }, []);

  /* ---- Realtime: health score updates ---- */
  const wsChannel = useWorkspaceEvents(WORKSPACE_ID);

  useEvent<{ name: string; health: number; trend?: string }>(
    wsChannel,
    "health-score-update",
    (data) => {
      setClients((prev) =>
        prev.map((c) =>
          c.name === data.name
            ? { ...c, health: data.health, ...(data.trend ? { trend: data.trend } : {}) }
            : c
        )
      );
    }
  );

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

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
        <h1 className="text-3xl font-display font-bold text-white mb-4">Client Retention</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  const avgHealth = clients.length > 0 ? Math.round(clients.reduce((a, c) => a + c.health, 0) / clients.length) : 0;
  const atRisk = clients.filter((c) => c.health < 70).length;
  const healthy = clients.filter((c) => c.health >= 80).length;
  const avgNps = clients.length > 0 ? (clients.reduce((a, c) => a + c.nps, 0) / clients.length).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Client Retention</h1>
      <p className="text-chamber-400 mb-8">Monitor client health and proactively address churn risk</p>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Avg Health", avgHealth.toString(), healthColor(avgHealth)],
          ["At Risk", atRisk.toString(), "text-red-400"],
          ["Healthy", healthy.toString(), "text-green-400"],
          ["Avg NPS", avgNps, "text-gold-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Client Health Table */}
      {clients.length === 0 ? (
        <div className="bg-chamber-900 rounded-xl p-12 border border-chamber-800 text-center">
          <p className="text-chamber-500">No client health data available.</p>
        </div>
      ) : (
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
              {[...clients].sort((a, b) => a.health - b.health).map((c) => (
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
                      {c.trend === "up" ? "\u2191" : c.trend === "down" ? "\u2193" : "\u2192"} {c.trend}
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
      )}
    </div>
  );
}
