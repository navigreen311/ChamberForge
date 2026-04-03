"use client";

import { useState } from "react";

interface PositioningResult {
  one_liner: string;
  elevator_pitch: string;
  pas_copy: { problem: string; agitate: string; solution: string };
  tagline: string;
}

interface Dream100Result {
  target_list_criteria: Record<string, unknown>;
  outreach_strategy: Record<string, unknown>;
  personalization_fields: string[];
  sequence_cadence: Record<string, unknown>;
}

export default function MarketingPage() {
  const [offerName, setOfferName] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [positioning, setPositioning] = useState<PositioningResult | null>(null);
  const [dream100, setDream100] = useState<Dream100Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"copy" | "dream100">("copy");

  const handleGenerateCopy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/sell/copy/positioning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: offerName,
          target_market: targetMarket,
          pain_points: painPoints.split(",").map((s) => s.trim()).filter(Boolean),
          outcomes: outcomes.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      setPositioning(data);
    } catch (err) {
      console.error("Failed to generate copy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDream100 = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/sell/marketing/dream-100", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: offerName,
          target_market: targetMarket,
          pain_points: painPoints.split(",").map((s) => s.trim()).filter(Boolean),
          outcomes: outcomes.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      setDream100(data);
    } catch (err) {
      console.error("Failed to generate Dream 100:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-white">Marketing & Copy</h1>
        <p className="mt-2 text-zinc-400">
          Generate positioning copy and Dream 100 outreach strategy
        </p>

        {/* Tabs */}
        <div className="mt-8 flex gap-2">
          <button
            onClick={() => setActiveTab("copy")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "copy"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Copy Generator
          </button>
          <button
            onClick={() => setActiveTab("dream100")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === "dream100"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Dream 100
          </button>
        </div>

        {/* Input Form */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Offer Name
              </label>
              <input
                type="text"
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., Executive Advisory Program"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Target Market
              </label>
              <input
                type="text"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., PE-backed SaaS CEOs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Pain Points (comma-separated)
              </label>
              <input
                type="text"
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., stalled growth, high churn, weak positioning"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Desired Outcomes (comma-separated)
              </label>
              <input
                type="text"
                value={outcomes}
                onChange={(e) => setOutcomes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., 3x revenue, market leadership"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {activeTab === "copy" ? (
              <button
                onClick={handleGenerateCopy}
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Copy"}
              </button>
            ) : (
              <button
                onClick={handleGenerateDream100}
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Dream 100"}
              </button>
            )}
          </div>
        </div>

        {/* Copy Results */}
        {activeTab === "copy" && positioning && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-emerald-400">
                One-Liner
              </h3>
              <p className="mt-2 text-white">{positioning.one_liner}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-emerald-400">
                Elevator Pitch
              </h3>
              <p className="mt-2 text-white">{positioning.elevator_pitch}</p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-emerald-400">
                PAS Framework
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <span className="text-sm font-medium text-red-400">
                    Problem:
                  </span>
                  <p className="mt-1 text-white">
                    {positioning.pas_copy.problem}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-amber-400">
                    Agitate:
                  </span>
                  <p className="mt-1 text-white">
                    {positioning.pas_copy.agitate}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-emerald-400">
                    Solution:
                  </span>
                  <p className="mt-1 text-white">
                    {positioning.pas_copy.solution}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-emerald-400">
                Tagline
              </h3>
              <p className="mt-2 text-xl font-bold text-white">
                {positioning.tagline}
              </p>
            </div>
          </div>
        )}

        {/* Dream 100 Results */}
        {activeTab === "dream100" && dream100 && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-emerald-400">
                Personalization Fields
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {dream100.personalization_fields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="text-lg font-semibold text-emerald-400">
                Full Strategy
              </h3>
              <pre className="mt-3 overflow-auto rounded-lg bg-zinc-800 p-4 text-sm text-zinc-300">
                {JSON.stringify(dream100, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
