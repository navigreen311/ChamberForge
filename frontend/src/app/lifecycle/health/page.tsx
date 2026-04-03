"use client";

import { useEffect, useState } from "react";
import HealthScoreChart from "@/components/modules/HealthScoreChart";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ClientRow {
  id: string;
  name: string;
  score: number | null;
  trend: { month: string; score: number }[];
  atRisk: boolean;
  trendDir: string;
}

const DEMO_CLIENTS = [
  { id: "client-alpha", name: "Alpha Family Office" },
  { id: "client-beta", name: "Beta Holdings" },
  { id: "client-gamma", name: "Gamma Trust" },
  { id: "client-delta", name: "Delta Ventures" },
  { id: "client-epsilon", name: "Epsilon Capital" },
];

export default function HealthDashboard() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      DEMO_CLIENTS.map(async (c) => {
        try {
          const [healthRes, trendRes] = await Promise.all([
            fetch(`${API}/api/v1/lifecycle/health/${c.id}`).then((r) => r.json()),
            fetch(`${API}/api/v1/lifecycle/health/trend/${c.id}`).then((r) => r.json()),
          ]);
          return {
            id: c.id,
            name: c.name,
            score: healthRes.latest_score,
            trend: trendRes.trend ?? [],
            atRisk: healthRes.churn_analysis?.at_risk ?? false,
            trendDir: healthRes.churn_analysis?.trend ?? "stable",
          };
        } catch {
          return { id: c.id, name: c.name, score: null, trend: [], atRisk: false, trendDir: "stable" };
        }
      })
    )
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (score: number | null) => {
    if (score === null) return "text-chamber-500";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const trendIcon = (dir: string) => {
    if (dir === "improving") return "↑";
    if (dir === "declining") return "↓";
    return "→";
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gold-400 mb-2">Client Health Monitor</h1>
      <p className="text-chamber-400 mb-8">Real-time health scores with churn detection</p>

      {loading ? (
        <p className="text-chamber-400 animate-pulse">Loading health data...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-chamber-700 text-chamber-400 text-sm uppercase tracking-wider">
                <th className="pb-3 pr-4">Client</th>
                <th className="pb-3 pr-4">Score</th>
                <th className="pb-3 pr-4">Trend</th>
                <th className="pb-3 pr-4">6-Month Sparkline</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-chamber-800 hover:bg-chamber-900/50">
                  <td className="py-4 pr-4 text-white font-medium">{r.name}</td>
                  <td className={`py-4 pr-4 font-bold text-lg ${scoreColor(r.score)}`}>
                    {r.score !== null ? r.score.toFixed(1) : "—"}
                  </td>
                  <td className="py-4 pr-4 text-chamber-300">
                    <span className="mr-1">{trendIcon(r.trendDir)}</span>
                    {r.trendDir}
                  </td>
                  <td className="py-4 pr-4">
                    <HealthScoreChart data={r.trend} />
                  </td>
                  <td className="py-4">
                    {r.atRisk ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                        At Risk
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
