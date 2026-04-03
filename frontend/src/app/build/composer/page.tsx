"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import PlaybookComposer from "@/components/modules/PlaybookComposer";

interface PlaybookTemplate {
  id: string;
  slug: string;
  name: string;
  icp: Record<string, unknown>;
  sop_skeleton: Array<{ name: string; steps: string[] }>;
  price_range_min: number;
  price_range_max: number;
  pricing_model: Record<string, unknown>;
  kpi_stack: string[];
}

interface ComposeResult {
  name: string;
  combined_icp: Record<string, unknown>;
  merged_sops: Array<{ name: string }>;
  combined_pricing: { min: number; max: number; pricing_model: string };
  unified_journey: Array<{ name: string }>;
  bundled_kpis: string[];
  bundle_pricing: {
    min_price: number;
    max_price: number;
    discount_applied: number;
    savings: number;
  };
  source_slugs: string[];
}

export default function ComposerPage() {
  const router = useRouter();
  const [playbooks, setPlaybooks] = useState<PlaybookTemplate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [result, setResult] = useState<ComposeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaybooks() {
      try {
        const res = await api.get("/api/v1/playbooks");
        const pbs = res.data?.playbooks ?? res.data ?? [];
        setPlaybooks(pbs);
      } catch {
        setError("Failed to load playbooks");
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybooks();
  }, []);

  function togglePlaybook(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) {
      next.delete(slug);
    } else if (next.size < 3) {
      next.add(slug);
    }
    setSelected(next);
  }

  async function handleCompose() {
    if (selected.size < 2) return;
    setComposing(true);
    setError(null);
    try {
      const wsId = localStorage.getItem("workspace_id") ?? "";
      const res = await api.post("/api/v1/playbooks/compose", {
        workspace_id: wsId,
        slugs: Array.from(selected),
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Compose failed");
    } finally {
      setComposing(false);
    }
  }

  async function handleCreateCombinedOffer() {
    if (!result) return;
    // For combined offers, we activate and create offers from each source playbook
    // For now, redirect to build with composed data stored
    const wsId = localStorage.getItem("workspace_id") ?? "";
    setComposing(true);
    try {
      // Activate the first playbook as the "primary" and create offer from it
      const primarySlug = result.source_slugs[0];
      const actRes = await api.post(`/api/v1/playbooks/${primarySlug}/activate`, {
        workspace_id: wsId,
      });
      const activationId = actRes.data?.activation?.id;
      if (activationId) {
        // Apply composed data as customizations
        await api.put(`/api/v1/playbooks/activations/${activationId}/customize`, {
          overrides: {
            name: result.name,
            icp: result.combined_icp,
            sop_skeleton: result.merged_sops,
            kpi_stack: result.bundled_kpis,
            pricing_model: result.combined_pricing,
          },
        });
        // Create offer from the activation
        const offerRes = await api.post(
          `/api/v1/playbooks/activations/${activationId}/create-offer`,
          { workspace_id: wsId }
        );
        const offerId = offerRes.data?.offer?.id;
        if (offerId) {
          router.push(`/build/offer/${offerId}`);
          return;
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to create combined offer");
    } finally {
      setComposing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build/playbooks" className="text-gold-400 text-sm hover:underline mb-4 inline-block">
        &larr; Back to Playbooks
      </a>
      <h1 className="text-3xl font-bold text-white mb-2">
        Cross-Playbook Composer
      </h1>
      <p className="text-chamber-400 mb-8">
        Select 2-3 playbooks to compose into a unified system with bundled pricing.
      </p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Playbook selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {playbooks.map((pb) => (
          <button
            key={pb.slug}
            onClick={() => togglePlaybook(pb.slug)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected.has(pb.slug)
                ? "bg-amber-900/20 border-amber-500 ring-2 ring-amber-500/30"
                : "bg-chamber-900 border-chamber-700 hover:border-chamber-500"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selected.has(pb.slug)
                    ? "border-amber-500 bg-amber-500"
                    : "border-chamber-500"
                }`}
              >
                {selected.has(pb.slug) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <span className="text-white font-semibold">{pb.name}</span>
            </div>
            <p className="text-chamber-400 text-sm">
              ${pb.price_range_min?.toLocaleString()} - ${pb.price_range_max?.toLocaleString()}
            </p>
            <p className="text-chamber-500 text-xs mt-1">
              {(pb.kpi_stack || []).length} KPIs | {(pb.sop_skeleton || []).length} SOPs
            </p>
          </button>
        ))}
      </div>

      {/* Compose button */}
      <button
        onClick={handleCompose}
        disabled={selected.size < 2 || composing}
        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-8"
      >
        {composing ? "Composing..." : `Compose ${selected.size} Playbooks`}
      </button>

      {/* Composed result */}
      {result && (
        <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">{result.name}</h3>

          {/* Bundle Pricing */}
          {result.bundle_pricing && (
            <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">Bundle Pricing</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${result.bundle_pricing.min_price.toLocaleString()}
                  </p>
                  <p className="text-chamber-400 text-xs">Min Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${result.bundle_pricing.max_price.toLocaleString()}
                  </p>
                  <p className="text-chamber-400 text-xs">Max Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {result.bundle_pricing.discount_applied}%
                  </p>
                  <p className="text-chamber-400 text-xs">Discount</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    ${result.bundle_pricing.savings.toLocaleString()}
                  </p>
                  <p className="text-chamber-400 text-xs">Savings</p>
                </div>
              </div>
            </div>
          )}

          {/* Merged SOPs */}
          <div>
            <h4 className="text-chamber-300 font-semibold mb-2">
              Merged SOPs ({result.merged_sops.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.merged_sops.map((sop, i) => (
                <span key={i} className="px-3 py-1 bg-chamber-800 text-chamber-300 text-sm rounded-full">
                  {sop.name}
                </span>
              ))}
            </div>
          </div>

          {/* Journey */}
          <div>
            <h4 className="text-chamber-300 font-semibold mb-2">Unified Journey</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {result.unified_journey.map((stage, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-sm rounded">
                    {stage.name}
                  </span>
                  {i < result.unified_journey.length - 1 && (
                    <span className="text-chamber-600">&rarr;</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div>
            <h4 className="text-chamber-300 font-semibold mb-2">
              Bundled KPIs ({result.bundled_kpis.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.bundled_kpis.map((kpi, i) => (
                <span key={i} className="px-3 py-1 bg-green-900/20 text-green-400 text-sm rounded-full border border-green-800">
                  {kpi}
                </span>
              ))}
            </div>
          </div>

          {/* Create Combined Offer button */}
          <button
            onClick={handleCreateCombinedOffer}
            disabled={composing}
            className="w-full mt-4 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-chamber-950 hover:bg-gold-400 disabled:opacity-50 transition"
          >
            {composing ? "Creating Offer..." : "Create Combined Offer"}
          </button>
        </div>
      )}
    </div>
  );
}
