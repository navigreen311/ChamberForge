"use client";

import { useState, useEffect } from "react";

const lifecycleData = [
  { stage: "Emerging", count: 12, color: "bg-green-400", pct: 28 },
  { stage: "Growing", count: 18, color: "bg-gold-400", pct: 42 },
  { stage: "Mature", count: 9, color: "bg-blue-400", pct: 21 },
  { stage: "Declining", count: 4, color: "bg-red-400", pct: 9 },
];

const emergingOpportunities = [
  { id: 1, name: "AI-Powered Estate Management", lifecycle: "Emerging", momentum: 94, signals: 8, category: "Technology", firstSeen: "2026-03-20" },
  { id: 2, name: "Sustainable Yacht Services", lifecycle: "Emerging", momentum: 87, signals: 6, category: "Marine", firstSeen: "2026-03-15" },
  { id: 3, name: "Digital Family Office Platform", lifecycle: "Growing", momentum: 82, signals: 12, category: "Finance", firstSeen: "2026-02-28" },
  { id: 4, name: "Private Health Concierge", lifecycle: "Emerging", momentum: 79, signals: 5, category: "Healthcare", firstSeen: "2026-03-25" },
  { id: 5, name: "Luxury EV Fleet Management", lifecycle: "Emerging", momentum: 76, signals: 4, category: "Automotive", firstSeen: "2026-03-28" },
  { id: 6, name: "Art Advisory Tokenization", lifecycle: "Growing", momentum: 71, signals: 7, category: "Finance", firstSeen: "2026-03-01" },
  { id: 7, name: "Estate Cybersecurity Services", lifecycle: "Growing", momentum: 68, signals: 9, category: "Technology", firstSeen: "2026-02-10" },
  { id: 8, name: "Philanthropic Impact Measurement", lifecycle: "Emerging", momentum: 65, signals: 3, category: "Advisory", firstSeen: "2026-03-30" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function TrendRadarPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/discover" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Discovery</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Trend Radar</h1>
      <p className="text-chamber-400 mb-8">Market lifecycle distribution and emerging opportunity signals</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Lifecycle Distribution Chart */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-6">Lifecycle Distribution</h3>
          <div className="space-y-4">
            {lifecycleData.map((d) => (
              <div key={d.stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-chamber-300">{d.stage}</span>
                  <span className="text-white font-medium">{d.count} problems ({d.pct}%)</span>
                </div>
                <div className="w-full h-4 bg-chamber-800 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full transition-all duration-1000`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-chamber-800 flex items-center justify-between">
            <span className="text-sm text-chamber-500">Total: 43 tracked problems</span>
            <span className="text-sm text-gold-400">70% in growth phases</span>
          </div>
        </div>

        {/* Radar Visualization (simplified) */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-6">Momentum Radar</h3>
          <div className="relative w-full aspect-square max-w-xs mx-auto">
            {/* Concentric circles */}
            {[100, 75, 50, 25].map((size) => (
              <div key={size} className="absolute border border-chamber-700 rounded-full" style={{ width: `${size}%`, height: `${size}%`, top: `${(100 - size) / 2}%`, left: `${(100 - size) / 2}%` }} />
            ))}
            {/* Crosshairs */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-chamber-700" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-chamber-700" />
            {/* Data points */}
            {emergingOpportunities.slice(0, 6).map((o, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const radius = (o.momentum / 100) * 42;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              return (
                <div
                  key={o.id}
                  className="absolute w-3 h-3 rounded-full bg-gold-400 border-2 border-chamber-950 cursor-pointer hover:scale-150 transition"
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                  title={`${o.name}: ${o.momentum}`}
                />
              );
            })}
            <div className="absolute bottom-2 right-2 text-xs text-chamber-600">Hover for details</div>
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs text-chamber-500">
            <span>Center = Low momentum</span>
            <span>Edge = High momentum</span>
          </div>
        </div>
      </div>

      {/* Emerging Opportunities Table */}
      <h3 className="text-lg font-semibold text-white mb-4">Emerging Opportunities</h3>
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Opportunity</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Lifecycle</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Momentum</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Signals</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">First Seen</th>
            </tr>
          </thead>
          <tbody>
            {emergingOpportunities.map((o) => (
              <tr key={o.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium">{o.name}</td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{o.category}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${o.lifecycle === "Emerging" ? "bg-green-400/20 text-green-400" : "bg-gold-400/20 text-gold-400"}`}>{o.lifecycle}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-chamber-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full" style={{ width: `${o.momentum}%` }} />
                    </div>
                    <span className="text-sm text-chamber-300">{o.momentum}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{o.signals}</td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{o.firstSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
