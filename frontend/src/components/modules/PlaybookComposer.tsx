"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Playbook {
  id: string;
  name: string;
  icp: Record<string, unknown>;
  sops: Array<{ name: string; steps: string[] }>;
  pricing: { min: number; max: number; pricing_model: string };
  journey: Array<{ name: string }>;
  kpis: string[];
}

interface ComposeResult {
  name: string;
  combined_icp: Record<string, unknown>;
  merged_sops: Array<{ name: string }>;
  combined_pricing: { min: number; max: number; pricing_model: string };
  unified_journey: Array<{ name: string }>;
  bundled_kpis: string[];
}

interface PricingResult {
  min_price: number;
  max_price: number;
  discount_applied: number;
  savings: number;
}

interface PlaybookComposerProps {
  playbooks: Playbook[];
}

export default function PlaybookComposer({
  playbooks,
}: PlaybookComposerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<ComposeResult | null>(null);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [discount, setDiscount] = useState(10);
  const [loading, setLoading] = useState(false);

  function togglePlaybook(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else if (next.size < 3) {
      next.add(id);
    }
    setSelected(next);
  }

  async function compose() {
    const selectedPbs = playbooks.filter((pb) => selected.has(pb.id));
    if (selectedPbs.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/polish/compose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbooks: selectedPbs }),
      });
      const data = await res.json();
      setResult(data);

      // Also get pricing
      const prices = selectedPbs.map(
        (pb) => [pb.pricing.min, pb.pricing.max] as [number, number]
      );
      const pricingRes = await fetch(`${API}/api/v1/polish/compose/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playbook_prices: prices,
          discount_pct: discount,
        }),
      });
      setPricing(await pricingRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Playbook selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {playbooks.map((pb) => (
          <button
            key={pb.id}
            onClick={() => togglePlaybook(pb.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected.has(pb.id)
                ? "bg-amber-900/20 border-amber-500 ring-2 ring-amber-500/30"
                : "bg-chamber-900 border-chamber-700 hover:border-chamber-500"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selected.has(pb.id)
                    ? "border-amber-500 bg-amber-500"
                    : "border-chamber-500"
                }`}
              >
                {selected.has(pb.id) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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
              ${pb.pricing.min.toLocaleString()} - $
              {pb.pricing.max.toLocaleString()}
            </p>
            <p className="text-chamber-500 text-xs mt-1">
              {pb.kpis.length} KPIs | {pb.sops.length} SOPs
            </p>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={compose}
          disabled={selected.size < 2 || loading}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Composing..." : `Compose ${selected.size} Playbooks`}
        </button>
        <div className="flex items-center gap-2 text-sm text-chamber-400">
          <label>Discount:</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-16 px-2 py-1 bg-chamber-900 border border-chamber-700 rounded text-white text-center"
            min={0}
            max={50}
          />
          <span>%</span>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">{result.name}</h3>

          {/* Pricing */}
          {pricing && (
            <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
              <h4 className="text-amber-400 font-semibold mb-2">
                Bundle Pricing
              </h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${pricing.min_price.toLocaleString()}
                  </p>
                  <p className="text-chamber-400 text-xs">Min Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    ${pricing.max_price.toLocaleString()}
                  </p>
                  <p className="text-chamber-400 text-xs">Max Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {pricing.discount_applied}%
                  </p>
                  <p className="text-chamber-400 text-xs">Discount</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    ${pricing.savings.toLocaleString()}
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
                <span
                  key={i}
                  className="px-3 py-1 bg-chamber-800 text-chamber-300 text-sm rounded-full"
                >
                  {sop.name}
                </span>
              ))}
            </div>
          </div>

          {/* Journey */}
          <div>
            <h4 className="text-chamber-300 font-semibold mb-2">
              Unified Journey
            </h4>
            <div className="flex items-center gap-2">
              {result.unified_journey.map((stage, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-sm rounded">
                    {stage.name}
                  </span>
                  {i < result.unified_journey.length - 1 && (
                    <span className="text-chamber-600">→</span>
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
                <span
                  key={i}
                  className="px-3 py-1 bg-green-900/20 text-green-400 text-sm rounded-full border border-green-800"
                >
                  {kpi}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
