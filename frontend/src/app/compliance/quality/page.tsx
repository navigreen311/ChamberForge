"use client";

import { useState } from "react";
import SLAIndicator from "@/components/modules/SLAIndicator";

interface SLAItem {
  metric: string;
  target: number;
  actual: number;
  met: boolean;
}

interface RetentionRisk {
  client_id: string;
  client_name: string;
  risk_level: "low" | "medium" | "high";
  risk_score: number;
  signals: string[];
  recommended_action: string;
}

const MOCK_SLA_ITEMS: SLAItem[] = [
  { metric: "Response Time (hrs)", target: 4, actual: 3.2, met: true },
  { metric: "Resolution Time (hrs)", target: 24, actual: 18.5, met: true },
  { metric: "Client Satisfaction (%)", target: 95, actual: 97, met: true },
  { metric: "Report Delivery On-Time (%)", target: 98, actual: 96, met: false },
  { metric: "Meeting Prep Completion (%)", target: 100, actual: 100, met: true },
];

const MOCK_RISKS: RetentionRisk[] = [
  {
    client_id: "cl1",
    client_name: "Meridian Holdings",
    risk_level: "high",
    risk_score: 0.55,
    signals: ["AUM declined >10% in 90 days", "No login in 30+ days"],
    recommended_action: "Schedule immediate relationship review meeting",
  },
  {
    client_id: "cl2",
    client_name: "Vanguard Estates",
    risk_level: "medium",
    risk_score: 0.35,
    signals: ["Missed 2+ scheduled meetings", "3+ support complaints in 60 days"],
    recommended_action: "Send personalized check-in within 48 hours",
  },
  {
    client_id: "cl3",
    client_name: "Ashford Partners",
    risk_level: "low",
    risk_score: 0.1,
    signals: ["Marketing consent revoked"],
    recommended_action: "Continue standard engagement cadence",
  },
];

export default function QualityDashboard() {
  const [slaItems] = useState<SLAItem[]>(MOCK_SLA_ITEMS);
  const [risks] = useState<RetentionRisk[]>(MOCK_RISKS);

  const adherencePct =
    Math.round(
      (slaItems.filter((s) => s.met).length / slaItems.length) * 1000
    ) / 10;

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gold-400">
            Service Quality Dashboard
          </h1>
          <p className="text-chamber-400 mt-1">
            SLA adherence monitoring, onboarding quality, and retention risk detection
          </p>
        </div>

        {/* SLA Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6 flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-4">
              Overall SLA Adherence
            </h2>
            <SLAIndicator percentage={adherencePct} size={160} />
          </div>

          <div className="lg:col-span-2 bg-chamber-900 border border-chamber-800 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-4">
              SLA Breakdown
            </h2>
            <div className="space-y-3">
              {slaItems.map((item) => (
                <div key={item.metric} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-chamber-500 font-mono">
                          Target: {item.target}
                        </span>
                        <span
                          className={`text-sm font-mono font-medium ${
                            item.met ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {item.actual}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-chamber-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.met ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            item.metric.includes("Time")
                              ? (item.target / Math.max(item.actual, 0.1)) * 100
                              : (item.actual / item.target) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.met
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {item.met ? "MET" : "MISS"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Retention Risks */}
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-4">
            Retention Risk Detection
          </h2>
          <div className="space-y-4">
            {risks.map((risk) => (
              <div
                key={risk.client_id}
                className={`p-4 rounded-lg border ${
                  risk.risk_level === "high"
                    ? "border-red-500/30 bg-red-500/5"
                    : risk.risk_level === "medium"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-chamber-700 bg-chamber-800/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium">{risk.client_name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${
                        risk.risk_level === "high"
                          ? "bg-red-500/20 text-red-400"
                          : risk.risk_level === "medium"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-chamber-700 text-chamber-400"
                      }`}
                    >
                      {risk.risk_level} risk
                    </span>
                  </div>
                  <span className="text-xs text-chamber-500 font-mono">
                    Score: {(risk.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {risk.signals.map((signal, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-chamber-800 text-chamber-300 rounded"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-chamber-400">
                  Recommended: <span className="text-white">{risk.recommended_action}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
