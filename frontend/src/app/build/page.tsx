"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Offer {
  id: string;
  name: string;
  status: string;
  mrr: number;
  clients: number;
}

interface Playbook {
  slug: string;
  name: string;
  uses: number;
}

interface BillingSnapshot {
  mrr: number;
  active_subscriptions: number;
  pending_invoices: number;
  churn_rate: number;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function BuildPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [billing, setBilling] = useState<BillingSnapshot | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [offersRes, playbooksRes, billingRes] = await Promise.all([
          api.get("/api/v1/offers"),
          api.get("/api/v1/playbooks"),
          api.get("/api/v1/billing/revenue"),
        ]);
        setOffers(offersRes.data?.offers ?? offersRes.data ?? []);
        const pbData = playbooksRes.data?.playbooks ?? playbooksRes.data ?? [];
        setPlaybooks(pbData.slice(0, 3));
        setBilling(billingRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? err.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <h1 className="text-3xl font-display font-bold text-white mb-4">Build Hub</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString()}`;

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
      {billing && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ["MRR", fmt(billing.mrr), "text-gold-400"],
            ["Active Subscriptions", billing.active_subscriptions, "text-green-400"],
            ["Pending Invoices", billing.pending_invoices, "text-blue-400"],
            ["Churn Rate", `${billing.churn_rate}%`, "text-red-400"],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
              <p className="text-chamber-400 text-sm mb-1">{String(label)}</p>
              <p className={`text-2xl font-bold ${color}`}>{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offers */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Offers</h3>
            <a href="/build/offer/new" className="text-gold-400 text-sm hover:underline">Create new &rarr;</a>
          </div>
          <div className="space-y-3">
            {offers.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 mb-3 rounded-full bg-chamber-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-chamber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-chamber-400 text-sm mb-3">No offers yet. Create one from a discovered problem or activate a playbook.</p>
                <a href="/build/offer/new" className="text-gold-400 text-sm font-medium hover:underline">Create your first offer &rarr;</a>
              </div>
            )}
            {offers.map((o) => (
              <a key={o.id} href={`/build/offer/${o.id}`} className="flex items-center justify-between p-3 rounded-lg bg-chamber-800/50 hover:bg-chamber-800 transition">
                <div>
                  <p className="text-white font-medium">{o.name}</p>
                  <p className="text-xs text-chamber-500">{o.clients} clients &middot; ${o.mrr?.toLocaleString() ?? "0"}/mo</p>
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
            {playbooks.length === 0 && <p className="text-chamber-500 text-sm">No playbooks available.</p>}
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
