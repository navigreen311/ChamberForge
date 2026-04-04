"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface RevenueData {
  mrr: number;
  arr: number;
  active_subscriptions: number;
  past_due: number;
  mrr_history?: { month: string; value: number }[];
  subscriptions?: { client: string; plan: string; mrr: string; status: string; nextBill: string }[];
}

interface Invoice {
  id: string;
  client: string;
  amount: string;
  date: string;
  status: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    async function fetchBilling() {
      try {
        const [revenueRes, invoicesRes] = await Promise.all([
          api.get("/api/v1/billing/revenue"),
          api.get("/api/v1/billing/invoices"),
        ]);
        setRevenue(revenueRes.data);
        setInvoices(invoicesRes.data?.invoices ?? invoicesRes.data ?? []);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to load billing data");
      } finally {
        setLoading(false);
      }
    }
    fetchBilling();
  }, []);

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

  // Fallback to zeros when no revenue data
  const safeRevenue: RevenueData = revenue ?? { mrr: 0, arr: 0, active_subscriptions: 0, past_due: 0 };

  const mrrHistory = safeRevenue.mrr_history ?? [];
  const subscriptions = safeRevenue.subscriptions ?? [];
  const maxVal = mrrHistory.length > 0 ? Math.max(...mrrHistory.map((m) => m.value)) : 1;

  const fmtMoney = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Billing Dashboard</h1>
      <p className="text-chamber-400 mb-8">Revenue metrics, subscriptions, and invoice management</p>

      {/* Metrics — always render, show zeros gracefully */}
      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["MRR", fmtMoney(safeRevenue.mrr), "text-gold-400"],
          ["ARR", fmtMoney(safeRevenue.arr), "text-green-400"],
          ["Active Subscriptions", safeRevenue.active_subscriptions, "text-blue-400"],
          ["Past Due", safeRevenue.past_due, "text-red-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* MRR Chart */}
      {mrrHistory.length > 0 && (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions */}
        {subscriptions.length > 0 && (
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
        )}

        {/* Invoices */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Invoices</h3>
          {invoices.length === 0 ? (
            <p className="text-chamber-500 text-sm">No invoices found.</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
