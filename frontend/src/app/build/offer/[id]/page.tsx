"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface Offer {
  id: string;
  name: string;
  status: string;
  description: string;
  pricing: { model: string; base: string; tiers: string[] };
  metrics: { clients: number; mrr: string; satisfaction: string; avgLifetime: string };
  deliverables: string[];
}

const tabs = ["Overview", "Pricing", "Clients", "Analytics"];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function OfferDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await api.get(`/api/v1/offers/${id}`);
        const data = res.data?.offer ?? res.data;
        setOffer(data);
        setEditForm({ name: data.name, description: data.description });
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to load offer");
      } finally {
        setLoading(false);
      }
    }
    fetchOffer();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await api.put(`/api/v1/offers/${id}`, editForm);
      const data = res.data?.offer ?? res.data;
      setOffer(data);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to save offer");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error && !offer) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          {editing ? (
            <div className="space-y-3 mb-2">
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="text-3xl font-display font-bold bg-chamber-800 border border-chamber-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-gold-400 w-full" />
              <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-3 py-2 text-chamber-400 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-display font-bold text-white">{offer.name}</h1>
                <span className="px-2 py-0.5 bg-green-400/20 text-green-400 text-xs rounded-full">{offer.status}</span>
              </div>
              <p className="text-chamber-400 max-w-2xl">{offer.description}</p>
            </>
          )}
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition">Edit Offer</button>
        )}
      </div>

      {/* Metrics */}
      {offer.metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ["Clients", offer.metrics.clients],
            ["MRR", offer.metrics.mrr],
            ["Satisfaction", offer.metrics.satisfaction],
            ["Avg Lifetime", offer.metrics.avgLifetime],
          ].map(([label, value]) => (
            <div key={String(label)} className="bg-chamber-900 rounded-xl p-4 border border-chamber-800">
              <p className="text-chamber-400 text-sm">{String(label)}</p>
              <p className="text-xl font-bold text-white">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-chamber-800">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium transition border-b-2 ${activeTab === tab ? "border-gold-400 text-gold-400" : "border-transparent text-chamber-400 hover:text-white"}`}>{tab}</button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Core Deliverables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(offer.deliverables ?? []).map((d) => (
              <div key={d} className="flex items-center gap-3 p-3 bg-chamber-800/50 rounded-lg">
                <div className="w-2 h-2 bg-gold-400 rounded-full" />
                <span className="text-sm text-chamber-300">{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Pricing" && offer.pricing && (
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Pricing Tiers</h3>
          <p className="text-chamber-400 text-sm mb-4">Model: {offer.pricing.model}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(offer.pricing.tiers ?? []).map((tier, i) => {
              const [name, price] = tier.split(": ");
              return (
                <div key={tier} className={`p-5 rounded-xl border ${i === 1 ? "border-gold-400 bg-gold-400/5" : "border-chamber-700"}`}>
                  <p className={`font-semibold mb-1 ${i === 1 ? "text-gold-400" : "text-white"}`}>{name}</p>
                  <p className="text-2xl font-bold text-white">{price}</p>
                  {i === 1 && <span className="text-xs text-gold-400">Most Popular</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "Clients" && (
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Active Clients</h3>
          <p className="text-chamber-500 text-sm">Client list is loaded from the offer API.</p>
        </div>
      )}

      {activeTab === "Analytics" && (
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 text-center py-12">
          <p className="text-chamber-500">Analytics dashboard coming soon</p>
          <p className="text-sm text-chamber-600">Revenue trends, usage metrics, and client health data will appear here</p>
        </div>
      )}
    </div>
  );
}
