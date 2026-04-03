"use client";

import { useState } from "react";
import ExplainabilityReport from "@/components/modules/ExplainabilityReport";

interface EvidenceEntry {
  source: string;
  claim: string;
  credibility: number;
  freshness: number;
}

interface Assumption {
  assumption: string;
  impact_if_wrong: string;
}

interface SourceFreshness {
  source: string;
  age_days: number;
  decay_applied: number;
}

interface Report {
  agent: string;
  timestamp: string;
  evidence_chain: EvidenceEntry[];
  confidence_score: number;
  assumptions: Assumption[];
  source_freshness: SourceFreshness[];
  recommendation_basis: string;
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown>;
}

const MOCK_REPORT: Report = {
  agent: "PricingAgent",
  timestamp: "2026-04-03T14:30:00Z",
  evidence_chain: [
    { source: "Market Report Q1 2026", claim: "HNW retainers increased 12% YoY", credibility: 1.0, freshness: 0.025 },
    { source: "Industry Benchmark DB", claim: "Median wealth management retainer: $32K", credibility: 0.75, freshness: 0.05 },
    { source: "Client Historical Data", claim: "Client retention rate 94% at current pricing", credibility: 1.0, freshness: 0.0 },
  ],
  confidence_score: 0.87,
  assumptions: [
    { assumption: "Market conditions remain stable through Q2", impact_if_wrong: "Pricing may need 10-15% adjustment" },
    { assumption: "Client portfolio size stays within current band", impact_if_wrong: "Tier-based pricing may shift" },
  ],
  source_freshness: [
    { source: "Market Report Q1 2026", age_days: 15, decay_applied: 0.025 },
    { source: "Industry Benchmark DB", age_days: 30, decay_applied: 0.05 },
    { source: "Client Historical Data", age_days: 0, decay_applied: 0.0 },
  ],
  recommendation_basis:
    "Based on 3 source(s) with high aggregate confidence (87%). 2 assumption(s) flagged for review.",
  input_summary: { client_risk_profile: "moderate", market_conditions: "stable", current_retainer: 28000 },
  output_summary: { recommended_retainer: 31500, confidence: "high", adjustment_reason: "market uplift + retention premium" },
};

export default function ExplainabilityPage({ params }: { params: { outputId: string } }) {
  const [report] = useState<Report>(MOCK_REPORT);

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gold-400">
            AI Explainability Report
          </h1>
          <p className="text-chamber-400 mt-1">
            Agent: <span className="text-white font-mono">{report.agent}</span> | Output ID:{" "}
            <span className="text-white font-mono">{params.outputId}</span>
          </p>
          <p className="text-chamber-500 text-sm mt-1">
            Generated: {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>

        <ExplainabilityReport report={report} />

        {/* Input / Output Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-3">
              Input Summary
            </h3>
            <pre className="text-sm text-chamber-300 font-mono whitespace-pre-wrap">
              {JSON.stringify(report.input_summary, null, 2)}
            </pre>
          </div>
          <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-3">
              Output Summary
            </h3>
            <pre className="text-sm text-chamber-300 font-mono whitespace-pre-wrap">
              {JSON.stringify(report.output_summary, null, 2)}
            </pre>
          </div>
        </div>

        {/* Assumptions */}
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6 mt-6">
          <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-4">
            Assumptions & Risks
          </h3>
          <div className="space-y-3">
            {report.assumptions.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
                <span className="text-amber-400 mt-0.5 text-lg">!</span>
                <div>
                  <p className="text-sm text-white">{a.assumption}</p>
                  <p className="text-xs text-chamber-400 mt-1">
                    Impact if wrong: {a.impact_if_wrong}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Freshness */}
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6 mt-6">
          <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-4">
            Source Freshness
          </h3>
          <div className="space-y-2">
            {report.source_freshness.map((sf, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-chamber-800 last:border-0">
                <span className="text-sm text-white">{sf.source}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-chamber-400 font-mono">{sf.age_days}d old</span>
                  <span
                    className={`text-xs font-mono ${
                      sf.decay_applied < 0.03
                        ? "text-emerald-400"
                        : sf.decay_applied < 0.1
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    -{(sf.decay_applied * 100).toFixed(1)}% decay
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation Basis */}
        <div className="bg-chamber-900 border border-gold-400/20 rounded-lg p-6 mt-6">
          <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-2">
            Recommendation Basis
          </h3>
          <p className="text-chamber-300">{report.recommendation_basis}</p>
        </div>
      </div>
    </main>
  );
}
