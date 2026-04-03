"use client";

import { useState } from "react";
import api from "@/lib/api";

interface ScenarioResult {
  label: string;
  projected_clients: number;
  projected_mrr: number;
  projected_arr: number;
  net_new_clients: number;
  churn_count: number;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function ScenarioPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [formData, setFormData] = useState({
    base_price: 14000,
    base_clients: 18,
    adjustments: [
      { label: "Conservative", growth_rate: 5, churn_rate: 5, price_change: 0 },
      { label: "Moderate", growth_rate: 15, churn_rate: 3, price_change: 5 },
      { label: "Aggressive", growth_rate: 25, churn_rate: 2, price_change: 10 },
    ],
  });

  const runScenario = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/v1/lifecycle/scenario", formData);
      setScenarios(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to run scenario");
    } finally {
      setLoading(false);
    }
  };

  const updateAdjustment = (index: number, field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      adjustments: prev.adjustments.map((a, i) => i === index ? { ...a, [field]: value } : a),
    }));
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Scenario Planner</h1>
      <p className="text-chamber-400 mb-8">Model business assumptions and compare projected outcomes</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 space-y-6">
          <h3 className="text-lg font-semibold text-white">Base Assumptions</h3>

          <div>
            <label className="text-sm text-chamber-300 mb-1 block">Base Price ($/month)</label>
            <input
              type="number"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
              className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <div>
            <label className="text-sm text-chamber-300 mb-1 block">Current Clients</label>
            <input
              type="number"
              value={formData.base_clients}
              onChange={(e) => setFormData({ ...formData, base_clients: Number(e.target.value) })}
              className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          <h3 className="text-lg font-semibold text-white pt-2">Scenario Adjustments</h3>

          {formData.adjustments.map((adj, i) => (
            <div key={i} className="bg-chamber-800/50 rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={adj.label}
                onChange={(e) => {
                  const newAdj = [...formData.adjustments];
                  newAdj[i] = { ...newAdj[i], label: e.target.value };
                  setFormData({ ...formData, adjustments: newAdj });
                }}
                className="bg-transparent text-gold-400 font-semibold text-sm focus:outline-none border-b border-chamber-700 pb-1 w-full"
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-chamber-500 block mb-1">Growth %</label>
                  <input type="number" value={adj.growth_rate} onChange={(e) => updateAdjustment(i, "growth_rate", Number(e.target.value))}
                    className="w-full bg-chamber-800 border border-chamber-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-gold-400" />
                </div>
                <div>
                  <label className="text-xs text-chamber-500 block mb-1">Churn %</label>
                  <input type="number" value={adj.churn_rate} onChange={(e) => updateAdjustment(i, "churn_rate", Number(e.target.value))}
                    className="w-full bg-chamber-800 border border-chamber-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-gold-400" />
                </div>
                <div>
                  <label className="text-xs text-chamber-500 block mb-1">Price +%</label>
                  <input type="number" value={adj.price_change} onChange={(e) => updateAdjustment(i, "price_change", Number(e.target.value))}
                    className="w-full bg-chamber-800 border border-chamber-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-gold-400" />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={runScenario}
            disabled={loading}
            className="w-full px-5 py-3 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50"
          >
            {loading ? "Running Scenarios..." : "Run Scenarios"}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400">{error}</div>
          )}

          {scenarios.length === 0 && !loading ? (
            <div className="bg-chamber-900 rounded-xl p-8 border border-chamber-800 text-center text-chamber-500">
              Configure your assumptions and click &quot;Run Scenarios&quot; to see projections.
            </div>
          ) : loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            scenarios.map((s, i) => (
              <div key={i} className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30">
                <h3 className="text-lg font-semibold text-gold-400 mb-4">{s.label}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Projected Clients", s.projected_clients, "text-white"],
                    ["Net New Clients", s.net_new_clients > 0 ? `+${s.net_new_clients}` : s.net_new_clients, s.net_new_clients > 0 ? "text-green-400" : "text-red-400"],
                    ["Projected MRR", `$${s.projected_mrr.toLocaleString()}`, "text-gold-400"],
                    ["Projected ARR", `$${s.projected_arr.toLocaleString()}`, "text-gold-400"],
                    ["Churned (12mo)", s.churn_count, "text-red-400"],
                  ].map(([label, value, color]) => (
                    <div key={String(label)} className="p-3 bg-chamber-800/50 rounded-lg">
                      <p className="text-xs text-chamber-500">{String(label)}</p>
                      <p className={`text-xl font-bold ${color}`}>{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
