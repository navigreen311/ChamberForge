"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface ConsentOverview {
  total: number;
  active: number;
  expired: number;
  pending: number;
}

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  status: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function CompliancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentOverview, setConsentOverview] = useState<ConsentOverview>({ total: 0, active: 0, expired: 0, pending: 0 });
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [consentRes, qualityRes] = await Promise.all([
          api.get("/api/v1/compliance/consent/overview"),
          api.get("/api/v1/compliance/quality/metrics"),
        ]);
        setConsentOverview(consentRes.data);
        setQualityMetrics(qualityRes.data);
      } catch (err: any) {
        setError(err?.message || "Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <h1 className="text-3xl font-display font-bold text-white mb-4">Compliance Hub</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Compliance Hub</h1>
      <p className="text-chamber-400 mb-8">Consent management, quality monitoring, and regulatory compliance</p>

      {/* Consent Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Total Records", consentOverview.total, "text-white"],
          ["Active Consents", consentOverview.active, "text-green-400"],
          ["Expired", consentOverview.expired, "text-red-400"],
          ["Pending Review", consentOverview.pending, "text-gold-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consent Management */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Consent Management</h3>
            <a href="/compliance/consent" className="text-gold-400 text-sm hover:underline">View ledger &rarr;</a>
          </div>
          <p className="text-sm text-chamber-400 mb-4">Track and manage client data consent across all services and jurisdictions.</p>
          <div className="space-y-3">
            {[
              ["Active Consents", `${consentOverview.active} records`, "bg-green-400"],
              ["Expired Consents", `${consentOverview.expired} records`, "bg-red-400"],
              ["Pending Review", `${consentOverview.pending} records`, "bg-gold-400"],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-sm text-white">{String(label)}</span>
                </div>
                <span className="text-sm text-chamber-400">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Service Quality</h3>
            <a href="/compliance/quality" className="text-gold-400 text-sm hover:underline">View details &rarr;</a>
          </div>
          <div className="space-y-4">
            {qualityMetrics.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-chamber-300">{m.name}</span>
                  <span className={m.status === "pass" ? "text-green-400" : "text-red-400"}>{m.value}% / {m.target}%</span>
                </div>
                <div className="w-full h-2 bg-chamber-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.status === "pass" ? "bg-green-400" : "bg-red-400"}`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
