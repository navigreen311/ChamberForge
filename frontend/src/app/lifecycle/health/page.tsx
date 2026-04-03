"use client";

import { useState, useEffect } from "react";

const clients = [
  { name: "Henderson Family Office", health: 96, trend: [90, 92, 94, 95, 96, 96], mrr: "$22,000", segment: "Platinum" },
  { name: "Sterling Capital Group", health: 91, trend: [88, 89, 90, 90, 91, 91], mrr: "$22,000", segment: "Platinum" },
  { name: "Vanguard Family Trust", health: 88, trend: [82, 83, 85, 86, 87, 88], mrr: "$12,500", segment: "Gold" },
  { name: "Crown Estate Partners", health: 82, trend: [80, 81, 81, 82, 82, 82], mrr: "$22,000", segment: "Platinum" },
  { name: "Blackwell Holdings", health: 85, trend: [84, 84, 85, 85, 85, 85], mrr: "$12,500", segment: "Gold" },
  { name: "Meridian Ventures", health: 78, trend: [85, 83, 82, 80, 79, 78], mrr: "$12,500", segment: "Gold" },
  { name: "Apex Family Office", health: 68, trend: [78, 76, 74, 72, 70, 68], mrr: "$8,500", segment: "Silver" },
  { name: "Pacific Trust", health: 42, trend: [65, 58, 52, 48, 45, 42], mrr: "$8,500", segment: "Silver" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function HealthMonitorPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

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

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Client Health Monitor</h1>
      <p className="text-chamber-400 mb-8">Track health scores and identify trends across your client portfolio</p>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Portfolio Health", Math.round(clients.reduce((a, c) => a + c.health, 0) / clients.length).toString(), "text-gold-400"],
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

      {/* Client Table with Trend Sparklines */}
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Health</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">6-Month Trend</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Segment</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">MRR</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.sort((a, b) => a.health - b.health).map((c) => {
              const trendDir = c.trend[5] - c.trend[0];
              return (
                <tr key={c.name} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
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
                        <div key={i} className={`w-2 rounded-sm ${hBg(v)}`} style={{ height: `${(v / 100) * 100}%`, opacity: 0.4 + (i / 5) * 0.6 }} />
                      ))}
                    </div>
                    <span className={`text-xs ${trendDir > 0 ? "text-green-400" : trendDir < 0 ? "text-red-400" : "text-chamber-400"}`}>
                      {trendDir > 0 ? `+${trendDir}` : trendDir}
                    </span>
                  </td>
                  <td className="px-5 py-4"><span className="px-2 py-0.5 bg-chamber-800 text-chamber-300 text-xs rounded">{c.segment}</span></td>
                  <td className="px-5 py-4 text-chamber-300 text-sm">{c.mrr}</td>
                  <td className="px-5 py-4">
                    <a href={`/lifecycle/intel-brief/${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="text-gold-400 text-sm hover:underline">Intel Brief</a>
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
