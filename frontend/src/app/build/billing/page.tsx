"use client";

import { useState, useEffect } from "react";

const mrrHistory = [
  { month: "Nov", value: 98000 },
  { month: "Dec", value: 108000 },
  { month: "Jan", value: 118000 },
  { month: "Feb", value: 125000 },
  { month: "Mar", value: 135000 },
  { month: "Apr", value: 142500 },
];

const subscriptions = [
  { client: "Henderson Family Office", plan: "Platinum", mrr: "$22,000", status: "Active", nextBill: "2026-04-15" },
  { client: "Blackwell Holdings", plan: "Gold", mrr: "$12,500", status: "Active", nextBill: "2026-04-20" },
  { client: "Sterling Capital Group", plan: "Platinum", mrr: "$22,000", status: "Active", nextBill: "2026-04-18" },
  { client: "Meridian Ventures", plan: "Gold", mrr: "$12,500", status: "Active", nextBill: "2026-04-25" },
  { client: "Pacific Trust", plan: "Silver", mrr: "$8,500", status: "Past Due", nextBill: "2026-03-28" },
];

const invoices = [
  { id: "INV-2026-042", client: "Henderson Family Office", amount: "$22,000", date: "2026-04-01", status: "Paid" },
  { id: "INV-2026-041", client: "Blackwell Holdings", amount: "$12,500", date: "2026-04-01", status: "Paid" },
  { id: "INV-2026-040", client: "Pacific Trust", amount: "$8,500", date: "2026-03-28", status: "Overdue" },
  { id: "INV-2026-039", client: "Sterling Capital Group", amount: "$22,000", date: "2026-03-15", status: "Paid" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const maxVal = Math.max(...mrrHistory.map((m) => m.value));

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Billing Dashboard</h1>
      <p className="text-chamber-400 mb-8">Revenue metrics, subscriptions, and invoice management</p>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["MRR", "$142,500", "text-gold-400"],
          ["ARR", "$1.71M", "text-green-400"],
          ["Active Subscriptions", "18", "text-blue-400"],
          ["Past Due", "1", "text-red-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* MRR Chart */}
      <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">MRR Growth</h3>
        <div className="flex items-end gap-3 h-48">
          {mrrHistory.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-chamber-400">${(m.value / 1000).toFixed(0)}K</span>
              <div className="w-full bg-gold-400/80 rounded-t transition-all" style={{ height: `${(m.value / maxVal) * 100}%` }} />
              <span className="text-xs text-chamber-500">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Active Subscriptions</h3>
          <div className="space-y-3">
            {subscriptions.map((s) => (
              <div key={s.client} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium text-sm">{s.client}</p>
                  <p className="text-xs text-chamber-500">{s.plan} &middot; {s.mrr}/mo</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${s.status === "Active" ? "bg-green-400/20 text-green-400" : "bg-red-400/20 text-red-400"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium text-sm">{inv.id}</p>
                  <p className="text-xs text-chamber-500">{inv.client} &middot; {inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">{inv.amount}</p>
                  <span className={`text-xs ${inv.status === "Paid" ? "text-green-400" : "text-red-400"}`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
