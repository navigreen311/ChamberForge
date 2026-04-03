"use client";

import { useState } from "react";
import api from "@/lib/api";

interface Projection {
  month: string;
  clients: number;
  mrr: number;
  growth: number;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [form, setForm] = useState({
    monthly_price: "12500",
    clients_month_1: "18",
    growth_rate: "8",
    churn_rate: "2",
    months: "9",
  });

  async function handleProject() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/v1/sell/revenue/project", {
        monthly_price: parseFloat(form.monthly_price) || 0,
        clients_month_1: parseInt(form.clients_month_1) || 0,
        growth_rate: parseFloat(form.growth_rate) || 0,
        churn_rate: parseFloat(form.churn_rate) || 0,
        months: parseInt(form.months) || 9,
      });
      setProjections(res.data?.projections ?? res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to generate projection");
    } finally {
      setLoading(false);
    }
  }

  const maxMrr = projections.length > 0 ? Math.max(...projections.map((p) => p.mrr)) : 1;
  const lastProjection = projections.length > 0 ? projections[projections.length - 1] : null;
  const avgGrowth = projections.length > 0
    ? (projections.reduce((a, p) => a + p.growth, 0) / projections.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Revenue Projector</h1>
      <p className="text-chamber-400 mb-8">Model future revenue based on pipeline and growth assumptions</p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Input Form */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Assumptions</h3>
          <div className="space-y-4">
            {[
              ["Avg Deal Size ($/mo)", "monthly_price"],
              ["Starting Clients", "clients_month_1"],
              ["Monthly Growth Rate (%)", "growth_rate"],
              ["Monthly Churn (%)", "churn_rate"],
              ["Months to Project", "months"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="text-sm text-chamber-300 mb-1 block">{String(label)}</label>
                <input type="text" value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400" />
              </div>
            ))}
            <button onClick={handleProject} disabled={loading} className="w-full px-4 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50">
              {loading ? "Projecting..." : "Run Projection"}
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          {projections.length === 0 ? (
            <div className="flex items-center justify-center h-full text-chamber-500">
              <p>Enter assumptions and click Run Projection to see results</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white mb-4">{projections.length}-Month MRR Projection</h3>
              <div className="flex items-end gap-2 h-52 mb-4">
                {projections.map((p) => (
                  <div key={p.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-chamber-400">${(p.mrr / 1000).toFixed(0)}K</span>
                    <div className="w-full bg-gold-400/80 rounded-t transition-all" style={{ height: `${(p.mrr / maxMrr) * 100}%` }} />
                    <span className="text-xs text-chamber-500 -rotate-45 origin-top-left whitespace-nowrap">{p.month.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
              {lastProjection && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-chamber-800">
                  <div>
                    <p className="text-chamber-500 text-xs">Projected Final MRR</p>
                    <p className="text-xl font-bold text-gold-400">${(lastProjection.mrr / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-chamber-500 text-xs">Projected Final ARR</p>
                    <p className="text-xl font-bold text-green-400">${((lastProjection.mrr * 12) / 1_000_000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-chamber-500 text-xs">Avg Growth Rate</p>
                    <p className="text-xl font-bold text-blue-400">{avgGrowth}%</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Projection Table */}
      {projections.length > 0 && (
        <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-chamber-800">
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Month</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Clients</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">MRR</th>
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.month} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-5 py-3 text-white text-sm">{p.month}</td>
                  <td className="px-5 py-3 text-chamber-300 text-sm">{p.clients}</td>
                  <td className="px-5 py-3 text-gold-400 font-medium text-sm">${p.mrr.toLocaleString()}</td>
                  <td className="px-5 py-3 text-green-400 text-sm">+{p.growth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
