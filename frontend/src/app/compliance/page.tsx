"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ConsentSummary {
  active: number;
  revoked: number;
  pending_deletion: number;
}

interface QualityMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
}

export default function ComplianceDashboard() {
  const [consentSummary, setConsentSummary] = useState<ConsentSummary>({
    active: 142,
    revoked: 8,
    pending_deletion: 3,
  });

  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([
    { label: "SLA Adherence", value: 96.4, target: 95, unit: "%" },
    { label: "Onboarding Completion", value: 88, target: 90, unit: "%" },
    { label: "Response Time", value: 3.2, target: 4, unit: "hrs" },
    { label: "Client Satisfaction", value: 97, target: 95, unit: "%" },
  ]);

  const [pendingReviews] = useState([
    { id: 1, type: "Consent Review", client: "Thornton Family Office", due: "2026-04-05" },
    { id: 2, type: "NDA Renewal", client: "Whitfield Trust", due: "2026-04-08" },
    { id: 3, type: "AI Audit", client: "Portfolio Rebalance — Chen", due: "2026-04-10" },
  ]);

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gold-400">
              Trust & Compliance
            </h1>
            <p className="text-chamber-400 mt-1">
              Consent management, AI transparency, and service quality monitoring
            </p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { href: "/compliance/consent", label: "Consent Ledger", icon: "🔒", desc: "Manage client consents" },
            { href: "/compliance/quality", label: "Service Quality", icon: "📊", desc: "SLA & onboarding metrics" },
            { href: "/compliance/comms", label: "Secure Comms", icon: "💬", desc: "Encrypted messaging" },
            { href: "/compliance/explainability/latest", label: "AI Explainability", icon: "🔍", desc: "Audit AI decisions" },
          ].map((nav) => (
            <Link
              key={nav.href}
              href={nav.href}
              className="block p-5 bg-chamber-900 border border-chamber-800 rounded-lg hover:border-gold-400/50 transition-colors"
            >
              <div className="text-2xl mb-2">{nav.icon}</div>
              <h3 className="text-lg font-semibold text-white">{nav.label}</h3>
              <p className="text-sm text-chamber-400 mt-1">{nav.desc}</p>
            </Link>
          ))}
        </div>

        {/* Consent Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Consent Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-chamber-300">Active Consents</span>
                <span className="text-emerald-400 font-mono text-lg">{consentSummary.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-chamber-300">Revoked</span>
                <span className="text-amber-400 font-mono text-lg">{consentSummary.revoked}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-chamber-300">Pending Deletion</span>
                <span className="text-red-400 font-mono text-lg">{consentSummary.pending_deletion}</span>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quality Metrics</h2>
            <div className="space-y-3">
              {qualityMetrics.map((m) => {
                const met = m.unit === "hrs" ? m.value <= m.target : m.value >= m.target;
                return (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-chamber-300">{m.label}</span>
                      <span className={`text-sm font-mono ${met ? "text-emerald-400" : "text-amber-400"}`}>
                        {m.value}{m.unit}
                      </span>
                    </div>
                    <div className="w-full bg-chamber-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${met ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{
                          width: `${Math.min(100, m.unit === "hrs" ? (m.target / m.value) * 100 : (m.value / m.target) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-chamber-900 border border-chamber-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pending Reviews</h2>
            <div className="space-y-3">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{review.type}</div>
                    <div className="text-xs text-chamber-400">{review.client}</div>
                  </div>
                  <span className="text-xs text-chamber-500 font-mono">{review.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
