"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface ClientHealth {
  client_id: string;
  name: string;
  health: number;
  trend: number[];
  mrr: string;
  segment: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function HealthMonitorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientHealth[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<any>(null);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await api.get("/api/v1/lifecycle/health");
        setClients(res.data);
      } catch (err: any) {
        setError(err?.message || "Failed to load health data");
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
  }, []);

  const fetchTrend = async (clientId: string) => {
    setSelectedClient(clientId);
    setTrendLoading(true);
    try {
      const res = await api.get(`/api/v1/lifecycle/health/trend/${clientId}`);
      setTrendData(res.data);
    } catch {
      setTrendData(null);
    } finally {
      setTrendLoading(false);
    }
  };

  const hColor = (h: number) => h >= 80 ? "text-green-400" : h >= 60 ? "text-gold-400" : "text-red-400";
  const hBg = (h: number) => h >= 80 ? "bg-green-400" : h >= 60 ? "bg-gold-400" : "bg-red-400";

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
        <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
        <h1 className="text-3xl font-display font-bold text-white mb-4">Client Health Monitor</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  const avgHealth = clients.length > 0 ? Math.round(clients.reduce((a, c) => a + c.health, 0) / clients.length) : 0;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Client Health Monitor</h1>
      <p className="text-chamber-400 mb-8">Track health scores and identify trends across your client portfolio</p>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Portfolio Health", avgHealth.toString(), "text-gold-400"],
          ["Healthy (80+)", clients.filter(c => c.health >= 80).length.toString(), "text-green-400"],
          ["At Risk (60-79)", clients.filter(c => c.health >= 60 && c.health < 80).length.toString(), "text-gold-400"],
          ["Critical (<60)", clients.filter(c => c.health < 60).length.toString(), "text-red-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Trend Detail */}
      {selectedClient && trendData && (
        <div className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Trend Detail: {clients.find(c => c.client_id === selectedClient)?.name}</h3>
            <button onClick={() => { setSelectedClient(null); setTrendData(null); }} className="text-chamber-400 text-sm hover:text-white">Close</button>
          </div>
          {trendLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <pre className="text-sm text-chamber-300 whitespace-pre-wrap">{JSON.stringify(trendData, null, 2)}</pre>
          )}
        </div>
      )}

      {/* Client Table */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Health</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">6-Month Trend</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Segment</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">MRR</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-chamber-500">No client health data found.</td></tr>
            ) : clients.sort((a, b) => a.health - b.health).map((c) => {
              const trendDir = c.trend.length >= 2 ? c.trend[c.trend.length - 1] - c.trend[0] : 0;
              return (
                <tr key={c.client_id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-5 py-4 text-white font-medium">{c.name}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-chamber-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${hBg(c.health)}`} style={{ width: `${c.health}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${hColor(c.health)}`}>{c.health}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-end gap-1 h-6">
                      {c.trend.map((v, i) => (
                        <div key={i} className={`w-2 rounded-sm ${hBg(v)}`} style={{ height: `${(v / 100) * 100}%`, opacity: 0.4 + (i / Math.max(c.trend.length - 1, 1)) * 0.6 }} />
                      ))}
                    </div>
                    <span className={`text-xs ${trendDir > 0 ? "text-green-400" : trendDir < 0 ? "text-red-400" : "text-chamber-400"}`}>
                      {trendDir > 0 ? `+${trendDir}` : trendDir}
                    </span>
                  </td>
                  <td className="px-5 py-4"><span className="px-2 py-0.5 bg-chamber-800 text-chamber-300 text-xs rounded">{c.segment}</span></td>
                  <td className="px-5 py-4 text-chamber-300 text-sm">{c.mrr}</td>
                  <td className="px-5 py-4 flex gap-2">
                    <a href={`/lifecycle/intel-brief/${c.client_id}`} className="text-gold-400 text-sm hover:underline">Intel Brief</a>
                    <button onClick={() => fetchTrend(c.client_id)} className="text-blue-400 text-sm hover:underline">Trend</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
