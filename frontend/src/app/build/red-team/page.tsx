"use client";

import { useState } from "react";
import AuditScorecard from "@/components/modules/AuditScorecard";
import api from "@/lib/api";

interface AuditResult {
  overall_status: "PASS" | "WARN" | "FAIL";
  score: number;
  dimensions: Array<{
    name: string;
    status: "PASS" | "WARN" | "FAIL";
    score: number;
    findings: string[];
    recommendations: string[];
  }>;
}

const EXAMPLE_OFFER = JSON.stringify(
  {
    name: "Premium Wealth Planning",
    description:
      "Comprehensive financial planning for high-net-worth families",
    services: ["portfolio review", "estate planning", "tax optimization"],
    team: [
      { name: "Senior Advisor" },
      { name: "Tax Specialist" },
      { name: "Estate Planner" },
    ],
    channels: ["in-person", "video", "phone"],
    delivery_model: { automation_level: "partial" },
    pricing: { max: 100000 },
    costs: { total: 40000 },
    proprietary_elements: ["Proprietary risk model"],
    partnerships: ["Top-tier custodian"],
    target_market: "UHNW families",
  },
  null,
  2
);

export default function RedTeamPage() {
  const [offerJson, setOfferJson] = useState(EXAMPLE_OFFER);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runAudit() {
    setError("");
    setLoading(true);
    try {
      const offerData = JSON.parse(offerJson);
      const res = await api.post(`/api/v1/polish/red-team`, { offer_data: offerData });
      setResult(res.data);
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "Invalid JSON — check your offer data"
          : "Audit request failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Red-Team Offer Auditor
      </h1>
      <p className="text-chamber-400 mb-8">
        Adversarial analysis across 5 dimensions: compliance, delivery
        fragility, margin stress, competitive vulnerability, reputation risk.
      </p>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-chamber-300 text-sm font-semibold mb-2">
          Offer Data (JSON)
        </label>
        <textarea
          value={offerJson}
          onChange={(e) => setOfferJson(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-chamber-900 border border-chamber-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <button
        onClick={runAudit}
        disabled={loading}
        className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 mb-8"
      >
        {loading ? "Running Audit..." : "Run Red-Team Audit"}
      </button>

      {/* Results */}
      {result && <AuditScorecard result={result} />}
    </div>
  );
}
