"use client";

import { useEffect, useState, useCallback } from "react";
import ProblemCard from "@/components/modules/ProblemCard";
import TrendRadar from "@/components/modules/TrendRadar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Problem {
  id: string;
  title: string;
  description?: string | null;
  urgency_score?: number | null;
  wealth_tier?: string | null;
  lifecycle_stage?: string | null;
  pain_category?: string | null;
}

const TIER_OPTIONS = ["", "affluent", "hnw", "uhnw", "family_office"];
const PAIN_OPTIONS = [
  "",
  "wealth_preservation",
  "tax_optimization",
  "estate_planning",
  "lifestyle_management",
  "privacy_security",
  "family_governance",
  "philanthropy",
  "concierge",
  "compliance",
  "investment",
];
const LIFECYCLE_OPTIONS = ["", "emerging", "accelerating", "proven", "saturated", "declining"];

export default function DiscoverPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [painCat, setPainCat] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [minUrgency, setMinUrgency] = useState(1);
  const [scanning, setScanning] = useState(false);

  const fetchProblems = useCallback(async () => {
    const params = new URLSearchParams();
    if (tier) params.set("wealth_tier", tier);
    if (painCat) params.set("pain_category", painCat);
    if (lifecycle) params.set("lifecycle_stage", lifecycle);
    if (minUrgency > 1) params.set("min_urgency", String(minUrgency));
    const res = await fetch(`${API_BASE}/api/v1/problems/?${params}`);
    const data = await res.json();
    setProblems(data.items ?? []);
  }, [tier, painCat, lifecycle, minUrgency]);

  const fetchDistribution = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/v1/discovery/lifecycle-distribution`);
    const data = await res.json();
    setDistribution(data);
  }, []);

  useEffect(() => {
    fetchProblems();
    fetchDistribution();
  }, [fetchProblems, fetchDistribution]);

  const runDiscovery = async () => {
    setScanning(true);
    try {
      await fetch(`${API_BASE}/api/v1/discovery/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: [
            "latest HNW wealth management trends",
            "UHNW family office challenges 2026",
            "premium service market gaps",
          ],
        }),
      });
      await fetchProblems();
      await fetchDistribution();
    } finally {
      setScanning(false);
    }
  };

  const filtered = problems.filter((p) =>
    search
      ? p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <main className="min-h-screen bg-chamber-950 text-white">
      {/* Top bar */}
      <header className="border-b border-chamber-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-gold-400">
            Problem Discovery
          </h1>
          <button
            onClick={runDiscovery}
            disabled={scanning}
            className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-chamber-950 transition hover:bg-gold-400 disabled:opacity-50"
          >
            {scanning ? "Scanning..." : "Run AI Discovery"}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-6">
        {/* Sidebar filters */}
        <aside className="w-64 shrink-0 space-y-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-chamber-400">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white placeholder-chamber-500 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-chamber-400">
              Wealth Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none"
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t ? t.replace(/_/g, " ").toUpperCase() : "All Tiers"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-chamber-400">
              Pain Category
            </label>
            <select
              value={painCat}
              onChange={(e) => setPainCat(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none"
            >
              {PAIN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p ? p.replace(/_/g, " ") : "All Categories"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-chamber-400">
              Lifecycle Stage
            </label>
            <select
              value={lifecycle}
              onChange={(e) => setLifecycle(e.target.value)}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-900 px-3 py-2 text-sm text-white focus:border-gold-400 focus:outline-none"
            >
              {LIFECYCLE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l ? l.charAt(0).toUpperCase() + l.slice(1) : "All Stages"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-chamber-400">
              Min Urgency: {minUrgency}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={minUrgency}
              onChange={(e) => setMinUrgency(Number(e.target.value))}
              className="w-full accent-gold-400"
            />
          </div>

          {/* Trend Radar */}
          <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-chamber-200">
              Trend Radar
            </h2>
            <TrendRadar distribution={distribution} />
          </div>
        </aside>

        {/* Problem Grid */}
        <section className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-chamber-400">
              No problems found. Run AI Discovery to populate.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProblemCard key={p.id} problem={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
