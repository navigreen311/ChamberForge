"use client";

import { useState } from "react";
import ScenarioSliders from "@/components/modules/ScenarioSliders";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Scenario {
  name: string;
  revenue: number;
  costs: number;
  profit: number;
  margin_pct: number;
  staff_needed: number;
}

interface ScenarioResult {
  scenarios: Scenario[];
  comparison_chart_data: { name: string; revenue: number; costs: number; profit: number }[];
}

export default function ScenarioPlannerPage() {
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (params: {
    basePrice: number;
    baseClients: number;
    margin: number;
    staffingCost: number;
    scaleFactor: number;
    wlDiscount: number;
  }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/lifecycle/scenario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_price: params.basePrice,
          base_clients: params.baseClients,
          adjustments: {
            margin: params.margin / 100,
            staffing_cost: params.staffingCost,
            scale_factor: params.scaleFactor,
            white_label_discount: params.wlDiscount / 100,
          },
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const marginColor = (pct: number) => {
    if (pct >= 60) return "text-green-400";
    if (pct >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gold-400 mb-2">Scenario Planner</h1>
      <p className="text-chamber-400 mb-8">Model revenue, costs, and profit under different conditions</p>

      <ScenarioSliders onRun={handleRun} loading={loading} />

      {result && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-chamber-700 text-chamber-400 text-sm uppercase tracking-wider">
                  <th className="pb-3 pr-4">Scenario</th>
                  <th className="pb-3 pr-4 text-right">Revenue</th>
                  <th className="pb-3 pr-4 text-right">Costs</th>
                  <th className="pb-3 pr-4 text-right">Profit</th>
                  <th className="pb-3 pr-4 text-right">Margin</th>
                  <th className="pb-3 text-right">Staff</th>
                </tr>
              </thead>
              <tbody>
                {result.scenarios.map((s) => (
                  <tr key={s.name} className="border-b border-chamber-800 hover:bg-chamber-900/50">
                    <td className="py-3 pr-4 text-white font-medium">{s.name}</td>
                    <td className="py-3 pr-4 text-right text-chamber-300">{fmt(s.revenue)}</td>
                    <td className="py-3 pr-4 text-right text-chamber-300">{fmt(s.costs)}</td>
                    <td className="py-3 pr-4 text-right text-white font-semibold">{fmt(s.profit)}</td>
                    <td className={`py-3 pr-4 text-right font-semibold ${marginColor(s.margin_pct)}`}>
                      {s.margin_pct.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right text-chamber-300">{s.staff_needed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple bar comparison */}
          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-white">Profit Comparison</h3>
            {result.scenarios.map((s) => {
              const maxProfit = Math.max(...result.scenarios.map((x) => x.profit), 1);
              const width = Math.max(0, (s.profit / maxProfit) * 100);
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-44 text-sm text-chamber-400 truncate">{s.name}</span>
                  <div className="flex-1 bg-chamber-800 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <span className="text-sm text-white w-28 text-right">{fmt(s.profit)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
