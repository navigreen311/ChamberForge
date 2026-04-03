"use client";

import { useState } from "react";

const TIERS = ["Affluent", "HNW", "UHNW", "Ultra"];
const STAGES = ["Accumulation", "Preservation", "Transition", "Legacy", "NextGen"];
const PAINS = [
  "Privacy", "Security", "Lifestyle", "Governance", "LegacyPlanning",
  "Reputation", "Travel", "Medical", "Education", "Concierge",
];

interface Profile {
  demographics: Record<string, unknown>;
  motivations: string[];
  primary_objections: string[];
  trust_channels: string[];
  buying_triggers: string[];
  recommended_approach: string;
  typical_decision_timeline: string;
}

export default function BuyerProfilePage() {
  const [tier, setTier] = useState("HNW");
  const [stage, setStage] = useState("Preservation");
  const [pain, setPain] = useState("Privacy");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/qualify/buyer-profile`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wealth_tier: tier,
            life_stage: stage,
            pain_category: pain,
          }),
        },
      );
      const data = await res.json();
      setProfile(data.profile);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <h1 className="text-2xl font-bold text-white">Buyer Profile Generator</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-white/60">Wealth Tier</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {TIERS.map((t) => (
              <option key={t} value={t} className="bg-gray-900">
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Life Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {STAGES.map((s) => (
              <option key={s} value={s} className="bg-gray-900">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/60">Pain Category</label>
          <select
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
          >
            {PAINS.map((p) => (
              <option key={p} value={p} className="bg-gray-900">
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Profile"}
      </button>

      {profile && (
        <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-6">
          <Section title="Demographics">
            <ul className="list-inside list-disc text-white/70">
              {Object.entries(profile.demographics).map(([k, v]) => (
                <li key={k}>
                  <span className="text-white/50">{k}:</span>{" "}
                  {Array.isArray(v) ? v.join(", ") : String(v)}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Motivations">
            <Tags items={profile.motivations} />
          </Section>

          <Section title="Primary Objections">
            <ul className="list-inside list-disc text-white/70">
              {profile.primary_objections.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </Section>

          <Section title="Trust Channels">
            <Tags items={profile.trust_channels} />
          </Section>

          <Section title="Buying Triggers">
            <Tags items={profile.buying_triggers} />
          </Section>

          <Section title="Recommended Approach">
            <p className="text-white/70">{profile.recommended_approach}</p>
          </Section>

          <Section title="Decision Timeline">
            <p className="text-white/70">{profile.typical_decision_timeline}</p>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/50">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
