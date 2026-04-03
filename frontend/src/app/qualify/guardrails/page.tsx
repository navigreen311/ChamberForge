"use client";

import { useState } from "react";
import GuardrailsBadge from "@/components/modules/GuardrailsBadge";

interface RuleResult {
  rule_id: string;
  rule_name: string;
  status: "PASS" | "WARN" | "BLOCK";
  reason: string;
}

interface GuardrailsResult {
  overall_status: "PASS" | "WARN" | "BLOCK";
  rules: RuleResult[];
}

const INITIAL_OFFER = JSON.stringify(
  {
    title: "Premium Privacy Shield",
    positioning: "privacy consultant",
    description: "Comprehensive digital footprint management for UHNW families",
    services: ["data-broker removal", "dark-web monitoring", "identity obfuscation"],
    pain_category: "Privacy",
    jurisdictions: ["US"],
    guarantee_framework: {},
    compliance_risk: "Low",
  },
  null,
  2,
);

export default function GuardrailsPage() {
  const [offerJson, setOfferJson] = useState(INITIAL_OFFER);
  const [result, setResult] = useState<GuardrailsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkGuardrails = async () => {
    setLoading(true);
    setError(null);
    try {
      const offerData = JSON.parse(offerJson);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/qualify/guardrails-check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offer_data: offerData }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <h1 className="text-2xl font-bold text-white">Guardrails Check</h1>
      <p className="text-white/50">
        Paste or edit offer data below and run the compliance check.
      </p>

      <textarea
        value={offerJson}
        onChange={(e) => setOfferJson(e.target.value)}
        rows={14}
        className="w-full rounded-lg border border-white/10 bg-white/5 p-4 font-mono text-sm text-white/80"
      />

      <button
        onClick={checkGuardrails}
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Run Guardrails Check"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-lg text-white/60">Overall:</span>
            <GuardrailsBadge status={result.overall_status} />
          </div>

          <div className="space-y-2">
            {result.rules.map((rule) => (
              <div
                key={rule.rule_id}
                className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 px-5 py-3"
              >
                <GuardrailsBadge status={rule.status} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {rule.rule_name}
                  </p>
                  <p className="text-sm text-white/50">{rule.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
