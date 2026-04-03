"use client";

import { useState, useEffect } from "react";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function ScenarioPage() {
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState({
    clientGrowth: 15,
    churnRate: 3,
    avgDealSize: 14000,
    marketExpansion: 2,
    priceIncrease: 5,
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Live calculations
  const currentClients = 18;
  const currentMrr = 142500;
  const newClients12m = Math.round(currentClients * (sliders.clientGrowth / 100) * 12);
  const churnedClients12m = Math.round(currentClients * (sliders.churnRate / 100) * 12);
  const netNewClients = newClients12m - churnedClients12m;
  const projectedClients = currentClients + netNewClients;
  const projectedMrr = Math.round((projectedClients * sliders.avgDealSize * (1 + sliders.priceIncrease / 100)));
  const projectedArr = projectedMrr * 12;
  const marketExpansionRevenue = sliders.marketExpansion * 85000;
  const totalProjectedArr = projectedArr + marketExpansionRevenue;

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Scenario Planner</h1>
      <p className="text-chamber-400 mb-8">Adjust business assumptions and see live projected outcomes</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 space-y-6">
          <h3 className="text-lg font-semibold text-white">Adjust Assumptions</h3>

          {[
            { label: "Monthly Client Growth Rate", key: "clientGrowth" as const, min: 0, max: 30, unit: "%" },
            { label: "Monthly Churn Rate", key: "churnRate" as const, min: 0, max: 15, unit: "%" },
            { label: "Average Deal Size", key: "avgDealSize" as const, min: 5000, max: 30000, unit: "$" },
            { label: "New Market Entries (12mo)", key: "marketExpansion" as const, min: 0, max: 5, unit: "" },
            { label: "Annual Price Increase", key: "priceIncrease" as const, min: 0, max: 20, unit: "%" },
          ].map((s) => (
            <div key={s.key}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-chamber-300">{s.label}</span>
                <span className="text-gold-400 font-medium">{s.unit === "$" ? `$${sliders[s.key].toLocaleString()}` : `${sliders[s.key]}${s.unit}`}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={sliders[s.key]}
                onChange={(e) => setSliders({ ...sliders, [s.key]: Number(e.target.value) })}
                className="w-full h-2 bg-chamber-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-400"
              />
              <div className="flex justify-between text-xs text-chamber-600 mt-1">
                <span>{s.unit === "$" ? `$${s.min.toLocaleString()}` : `${s.min}${s.unit}`}</span>
                <span>{s.unit === "$" ? `$${s.max.toLocaleString()}` : `${s.max}${s.unit}`}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Results */}
        <div className="space-y-6">
          <div className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30">
            <h3 className="text-lg font-semibold text-gold-400 mb-4">12-Month Projections</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Projected Clients", projectedClients, "text-white"],
                ["Net New Clients", netNewClients > 0 ? `+${netNewClients}` : netNewClients, netNewClients > 0 ? "text-green-400" : "text-red-400"],
                ["Projected MRR", `$${projectedMrr.toLocaleString()}`, "text-gold-400"],
                ["Projected ARR", `$${(totalProjectedArr).toLocaleString()}`, "text-gold-400"],
                ["New Clients (12mo)", newClients12m, "text-green-400"],
                ["Churned (12mo)", churnedClients12m, "text-red-400"],
                ["Market Expansion Rev", `$${marketExpansionRevenue.toLocaleString()}`, "text-blue-400"],
                ["MRR Growth", `${Math.round(((projectedMrr - currentMrr) / currentMrr) * 100)}%`, projectedMrr > currentMrr ? "text-green-400" : "text-red-400"],
              ].map(([label, value, color]) => (
                <div key={String(label)} className="p-3 bg-chamber-800/50 rounded-lg">
                  <p className="text-xs text-chamber-500">{String(label)}</p>
                  <p className={`text-xl font-bold ${color}`}>{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
            <h3 className="text-lg font-semibold text-white mb-4">Current vs Projected</h3>
            <div className="space-y-4">
              {[
                ["Clients", currentClients, projectedClients],
                ["MRR", currentMrr, projectedMrr],
                ["ARR", currentMrr * 12, totalProjectedArr],
              ].map(([label, current, projected]) => (
                <div key={String(label)}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-chamber-400">{String(label)}</span>
                    <span className="text-chamber-300">
                      {typeof current === "number" && current > 1000 ? `$${current.toLocaleString()}` : String(current)}
                      {" → "}
                      {typeof projected === "number" && Number(projected) > 1000 ? `$${Number(projected).toLocaleString()}` : String(projected)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-chamber-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-chamber-600 rounded-l" style={{ width: `${(Number(current) / Number(projected)) * 100}%` }} />
                    <div className="h-full bg-gold-400 rounded-r" style={{ width: `${100 - (Number(current) / Number(projected)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
