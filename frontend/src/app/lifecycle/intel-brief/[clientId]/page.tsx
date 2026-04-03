"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import IntelBriefCard from "@/components/modules/IntelBriefCard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ComplexityMap {
  wealth_tier: string;
  entities_count: number;
  jurisdictions: string[];
  active_risks: string[];
}

interface Brief {
  client_name: string;
  generated_at: string;
  summary: string;
  key_facts: string[];
  complexity_map: ComplexityMap;
  talking_points: string[];
  proof_assets_to_bring: string[];
  recent_changes: string[];
  recommended_approach: string;
}

export default function IntelBriefPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/lifecycle/intel-brief/${clientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_data: {
          name: "Demo Client",
          wealth_tier: "UHNW",
          entities: ["Family Trust", "Holdings LLC", "Foundation"],
          jurisdictions: ["US", "UK", "Singapore"],
          active_risks: ["Regulatory change in Singapore"],
          tenure_years: 7,
          aum: 45000000,
          engagement_type: "Full-Service Family Office",
        },
        meeting_context: "Quarterly strategic review",
      }),
    })
      .then((r) => r.json())
      .then(setBrief)
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-chamber-400 animate-pulse">Generating intelligence brief...</p>
      </main>
    );
  }

  if (!brief) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-red-400">Failed to generate brief.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gold-400">{brief.client_name}</h1>
          <p className="text-chamber-400 text-sm">
            Generated {new Date(brief.generated_at).toLocaleString()}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm bg-gold-500/20 text-gold-400 border border-gold-500/30">
          {brief.complexity_map.wealth_tier}
        </span>
      </div>

      {/* Summary */}
      <section className="bg-chamber-900 border border-chamber-700 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-2">Summary</h2>
        <p className="text-chamber-300">{brief.summary}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Key Facts */}
        <section className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Key Facts</h2>
          <ul className="space-y-2">
            {brief.key_facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-chamber-300">
                <span className="text-gold-400 mt-0.5">•</span>
                {fact}
              </li>
            ))}
          </ul>
        </section>

        {/* Complexity Map */}
        <section className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Complexity Map</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-chamber-500 text-xs uppercase">Wealth Tier</p>
              <p className="text-white font-semibold">{brief.complexity_map.wealth_tier}</p>
            </div>
            <div>
              <p className="text-chamber-500 text-xs uppercase">Entities</p>
              <p className="text-white font-semibold">{brief.complexity_map.entities_count}</p>
            </div>
            <div>
              <p className="text-chamber-500 text-xs uppercase">Jurisdictions</p>
              <p className="text-white font-semibold">
                {brief.complexity_map.jurisdictions.join(", ") || "Domestic"}
              </p>
            </div>
            <div>
              <p className="text-chamber-500 text-xs uppercase">Active Risks</p>
              <p className="text-white font-semibold">{brief.complexity_map.active_risks.length}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Talking Points */}
        <section className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Talking Points</h2>
          <ol className="space-y-2">
            {brief.talking_points.map((tp, i) => (
              <li key={i} className="flex items-start gap-3 text-chamber-300">
                <span className="bg-gold-500/20 text-gold-400 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">
                  {i + 1}
                </span>
                {tp}
              </li>
            ))}
          </ol>
        </section>

        {/* Proof Assets */}
        <section className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Bring to Meeting</h2>
          <ul className="space-y-2">
            {brief.proof_assets_to_bring.map((asset, i) => (
              <li key={i} className="flex items-center gap-2 text-chamber-300">
                <span className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0" />
                {asset}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recommended Approach */}
      <section className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gold-400 mb-2">Recommended Approach</h2>
        <p className="text-chamber-200">{brief.recommended_approach}</p>
      </section>

      {/* Compact Card Preview */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-3">Mobile Card Preview</h2>
        <IntelBriefCard brief={brief} />
      </section>
    </main>
  );
}
