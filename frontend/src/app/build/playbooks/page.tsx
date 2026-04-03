"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface Playbook {
  slug: string;
  name: string;
  desc?: string;
  description?: string;
  category: string;
  uses: number;
  steps: number;
  status: string;
}

interface ActivatedPlaybook {
  activation_id: string;
  playbook_name: string;
  playbook_slug: string;
  status: string;
  completion_pct: number;
  completed_sections: number;
  total_sections: number;
  next_step: string | null;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function PlaybooksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [activations, setActivations] = useState<ActivatedPlaybook[]>([]);
  const [creatingOfferId, setCreatingOfferId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get("/api/v1/playbooks");
        setPlaybooks(res.data?.playbooks ?? res.data ?? []);

        // Fetch activations if workspace_id is available
        const wsId = typeof window !== "undefined" ? localStorage.getItem("workspace_id") : null;
        if (wsId) {
          try {
            const actRes = await api.get(`/api/v1/playbooks/activations?workspace_id=${wsId}`);
            setActivations(actRes.data?.activations ?? []);
          } catch {
            // Activations fetch is non-critical
          }
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to load playbooks");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleCreateOffer(activationId: string) {
    const wsId = localStorage.getItem("workspace_id");
    if (!wsId) return;
    setCreatingOfferId(activationId);
    try {
      const res = await api.post(
        `/api/v1/playbooks/activations/${activationId}/create-offer`,
        { workspace_id: wsId }
      );
      const offerId = res.data?.offer?.id;
      if (offerId) {
        router.push(`/build/offer/${offerId}`);
      }
    } catch {
      // Silently handle — user can retry
    } finally {
      setCreatingOfferId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
        <h1 className="text-3xl font-display font-bold text-white mb-4">Playbook Gallery</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Playbook Gallery</h1>
      <p className="text-chamber-400 mb-8">Proven frameworks for every stage of premium service delivery</p>

      {/* Active Playbooks Section */}
      {activations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-1">Active Playbooks</h2>
          <p className="text-chamber-400 text-sm mb-4">Your activated playbooks with progress</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activations.map((act) => (
              <div
                key={act.activation_id}
                className="bg-chamber-900 rounded-xl p-5 border border-chamber-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{act.playbook_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    act.status === "completed"
                      ? "bg-emerald-400/20 text-emerald-400"
                      : "bg-gold-400/20 text-gold-400"
                  }`}>
                    {act.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-chamber-400 mb-1">
                    <span>{act.completed_sections}/{act.total_sections} sections</span>
                    <span>{act.completion_pct}%</span>
                  </div>
                  <div className="h-2 bg-chamber-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-500 rounded-full transition-all"
                      style={{ width: `${act.completion_pct}%` }}
                    />
                  </div>
                </div>

                {act.next_step && (
                  <p className="text-xs text-chamber-500 mb-4">
                    Next: {act.next_step}
                  </p>
                )}

                <div className="flex gap-2">
                  <a
                    href={`/build/playbooks/${act.playbook_slug}/activate`}
                    className="flex-1 rounded-lg border border-chamber-700 px-3 py-2 text-center text-xs text-chamber-300 hover:border-chamber-500 hover:text-white transition"
                  >
                    Continue
                  </a>
                  <button
                    onClick={() => handleCreateOffer(act.activation_id)}
                    disabled={creatingOfferId === act.activation_id}
                    className="flex-1 rounded-lg bg-gold-500 px-3 py-2 text-xs font-semibold text-chamber-950 hover:bg-gold-400 disabled:opacity-50 transition"
                  >
                    {creatingOfferId === act.activation_id ? "Creating..." : "Create Offer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playbook Gallery */}
      <h2 className="text-xl font-bold text-white mb-1">All Playbooks</h2>
      <p className="text-chamber-400 text-sm mb-4">Browse and activate playbook templates</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playbooks.map((p) => (
          <a key={p.slug} href={`/build/playbooks/${p.slug}`} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-chamber-800 text-chamber-400 text-xs rounded-full">{p.category}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "Active" ? "bg-green-400/20 text-green-400" : "bg-chamber-700 text-chamber-400"}`}>{p.status}</span>
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-gold-400 transition">{p.name}</h3>
            <p className="text-sm text-chamber-400 mb-4">{p.desc ?? p.description ?? ""}</p>
            <div className="flex items-center justify-between text-xs text-chamber-500">
              <span>{p.steps} steps</span>
              <span>{p.uses} times used</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
