"use client";

import { useState, useEffect } from "react";

const projections = [
  { month: "Apr 2026", clients: 18, mrr: 142500, growth: 5.6 },
  { month: "May 2026", clients: 20, mrr: 155000, growth: 8.8 },
  { month: "Jun 2026", clients: 22, mrr: 170000, growth: 9.7 },
  { month: "Jul 2026", clients: 24, mrr: 186000, growth: 9.4 },
  { month: "Aug 2026", clients: 26, mrr: 203000, growth: 9.1 },
  { month: "Sep 2026", clients: 28, mrr: 221000, growth: 8.9 },
  { month: "Oct 2026", clients: 30, mrr: 240000, growth: 8.6 },
  { month: "Nov 2026", clients: 32, mrr: 258000, growth: 7.5 },
  { month: "Dec 2026", clients: 34, mrr: 275000, growth: 6.6 },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ avgDeal: "12500", closureRate: "25", monthlyLeads: "12", churnRate: "2" });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const maxMrr = Math.max(...projections.map((p) => p.mrr));

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-3 gap-6"><Skeleton className="h-64" /><div className="col-span-2"><Skeleton className="h-64" /></div></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Revenue Projector</h1>
      <p className="text-chamber-400 mb-8">Model future revenue based on pipeline and growth assumptions</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Input Form */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Assumptions</h3>
          <div className="space-y-4">
            {[
              ["Avg Deal Size ($/mo)", "avgDeal"],
              ["Close Rate (%)", "closureRate"],
              ["Monthly Leads", "monthlyLeads"],
              ["Monthly Churn (%)", "churnRate"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="text-sm text-chamber-300 mb-1 block">{String(label)}</label>
                <input type="text" value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400" />
              </div>
            ))}
            <button className="w-full px-4 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Update Projection</button>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">9-Month MRR Projection</h3>
          <div className="flex items-end gap-2 h-52 mb-4">
            {projections.map((p) => (
              <div key={p.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-chamber-400">${(p.mrr / 1000).toFixed(0)}K</span>
                <div className="w-full bg-gold-400/80 rounded-t transition-all" style={{ height: `${(p.mrr / maxMrr) * 100}%` }} />
                <span className="text-xs text-chamber-500 -rotate-45 origin-top-left whitespace-nowrap">{p.month.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-chamber-800">
            <div>
              <p className="text-chamber-500 text-xs">Projected Dec MRR</p>
              <p className="text-xl font-bold text-gold-400">$275K</p>
            </div>
            <div>
              <p className="text-chamber-500 text-xs">Projected Dec ARR</p>
              <p className="text-xl font-bold text-green-400">$3.3M</p>
            </div>
            <div>
              <p className="text-chamber-500 text-xs">Avg Growth Rate</p>
              <p className="text-xl font-bold text-blue-400">8.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Table */}
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
    </div>
  );
}
