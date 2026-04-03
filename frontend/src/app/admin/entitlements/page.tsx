"use client";

import { useState } from "react";

const PLANS = ["core", "pro", "enterprise"] as const;
const ALL_FEATURES = [
  "discover",
  "qualify",
  "build_basic",
  "sell",
  "lifecycle",
  "playbooks",
  "compliance",
  "admin",
  "api_access",
  "white_label",
];

const PLAN_FEATURES: Record<string, string[]> = {
  core: ["discover", "qualify", "build_basic"],
  pro: ["discover", "qualify", "build_basic", "sell", "lifecycle", "playbooks"],
  enterprise: ALL_FEATURES,
};

interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPct: number;
}

export default function EntitlementsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    { name: "new_dashboard_v2", enabled: true, rolloutPct: 50 },
    { name: "advanced_analytics", enabled: false, rolloutPct: 0 },
    { name: "ai_copilot_beta", enabled: true, rolloutPct: 25 },
  ]);

  function toggleFlag(index: number) {
    setFlags((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, enabled: !f.enabled } : f
      )
    );
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gold-400 mb-2">
          Entitlements
        </h1>
        <p className="text-chamber-400 mb-8">
          Plan feature matrix and feature flag management
        </p>

        {/* Plan Matrix */}
        <h2 className="text-xl font-semibold text-white mb-4">Plan Matrix</h2>
        <div className="bg-chamber-900 border border-chamber-800 rounded-lg overflow-hidden mb-10">
          <table className="w-full text-left">
            <thead className="bg-chamber-800">
              <tr>
                <th className="px-4 py-3 text-chamber-300 text-sm font-medium">
                  Feature
                </th>
                {PLANS.map((plan) => (
                  <th
                    key={plan}
                    className="px-4 py-3 text-chamber-300 text-sm font-medium capitalize text-center"
                  >
                    {plan}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((feature) => (
                <tr key={feature} className="border-t border-chamber-800">
                  <td className="px-4 py-3 text-white text-sm font-mono">
                    {feature}
                  </td>
                  {PLANS.map((plan) => (
                    <td
                      key={`${plan}-${feature}`}
                      className="px-4 py-3 text-center"
                    >
                      {PLAN_FEATURES[plan].includes(feature) ? (
                        <span className="text-emerald-400 text-lg">&#10003;</span>
                      ) : (
                        <span className="text-chamber-700">&#8212;</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Feature Flags */}
        <h2 className="text-xl font-semibold text-white mb-4">
          Feature Flags
        </h2>
        <div className="space-y-3">
          {flags.map((flag, idx) => (
            <div
              key={flag.name}
              className="bg-chamber-900 border border-chamber-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-white font-mono text-sm">{flag.name}</div>
                <div className="text-chamber-500 text-xs mt-1">
                  Rollout: {flag.rolloutPct}%
                </div>
              </div>
              <button
                onClick={() => toggleFlag(idx)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  flag.enabled ? "bg-emerald-500" : "bg-chamber-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    flag.enabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
