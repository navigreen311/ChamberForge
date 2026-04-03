"use client";

import { useState, useEffect } from "react";

const offers = [
  { id: "off-001", name: "Private Aviation Concierge", status: "Active", mrr: "$12,500", clients: 3 },
  { id: "off-002", name: "Estate Management Platform", status: "Draft", mrr: "$0", clients: 0 },
  { id: "off-003", name: "Family Office Advisory", status: "Active", mrr: "$28,000", clients: 7 },
];

const playbooks = [
  { slug: "discovery-to-deal", name: "Discovery to Deal", uses: 14 },
  { slug: "uhnw-onboarding", name: "UHNW Onboarding", uses: 9 },
  { slug: "retention-playbook", name: "Client Retention", uses: 22 },
];

const billingSnapshot = { mrr: "$142,500", activeSubs: 18, pendingInvoices: 3, churn: "2.1%" };

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function BuildPage() {
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
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Build Hub</h1>
          <p className="text-chamber-400">Create offers, deploy playbooks, and manage billing</p>
        </div>
        <a href="/build/offer/new" className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">New Offer</a>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["MRR", billingSnapshot.mrr, "text-gold-400"],
          ["Active Subscriptions", billingSnapshot.activeSubs, "text-green-400"],
          ["Pending Invoices", billingSnapshot.pendingInvoices, "text-blue-400"],
          ["Churn Rate", billingSnapshot.churn, "text-red-400"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm mb-1">{String(label)}</p>
            <p className={`text-2xl font-bold ${color}`}>{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offers */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Offers</h3>
            <a href="/build/offer/new" className="text-gold-400 text-sm hover:underline">Create new &rarr;</a>
          </div>
          <div className="space-y-3">
            {offers.map((o) => (
              <a key={o.id} href={`/build/offer/${o.id}`} className="flex items-center justify-between p-3 rounded-lg bg-chamber-800/50 hover:bg-chamber-800 transition">
                <div>
                  <p className="text-white font-medium">{o.name}</p>
                  <p className="text-xs text-chamber-500">{o.clients} clients &middot; {o.mrr}/mo</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${o.status === "Active" ? "bg-green-400/20 text-green-400" : "bg-chamber-700 text-chamber-400"}`}>{o.status}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Playbooks */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Playbooks</h3>
            <a href="/build/playbooks" className="text-gold-400 text-sm hover:underline">View all &rarr;</a>
          </div>
          <div className="space-y-3">
            {playbooks.map((p) => (
              <a key={p.slug} href={`/build/playbooks/${p.slug}`} className="flex items-center justify-between p-3 rounded-lg bg-chamber-800/50 hover:bg-chamber-800 transition">
                <p className="text-white font-medium">{p.name}</p>
                <span className="text-sm text-chamber-400">{p.uses} uses</span>
              </a>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-chamber-800">
            <a href="/build/billing" className="text-gold-400 text-sm hover:underline">View billing dashboard &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  );
}
