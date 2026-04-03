"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface RetentionRisk {
  client_id: string;
  client_name: string;
  risk_score: number;
  risk_factors: string[];
  recommended_actions: string[];
  health_score: number;
  trend: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function QualityPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [risks, setRisks] = useState<RetentionRisk[]>([]);

  useEffect(() => {
    async function fetchRisks() {
      try {
        const res = await api.get("/api/v1/compliance/quality/retention-risks");
        setRisks(res.data);
      } catch (err: any) {
        setError(err?.message || "Failed to load retention risk data");
      } finally {
        setLoading(false);
      }
    }
    fetchRisks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/compliance" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Compliance</a>
        <h1 className="text-3xl font-display font-bold text-white mb-4">Service Quality</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  const criticalCount = risks.filter((r) => r.risk_score >= 80).length;
  const warningCount = risks.filter((r) => r.risk_score >= 50 && r.risk_score < 80).length;
  const healthyCount = risks.filter((r) => r.risk_score < 50).length;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/compliance" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Compliance</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Service Quality</h1>
      <p className="text-chamber-400 mb-8">Retention risk monitoring and quality metrics dashboard</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          ["Critical Risk", criticalCount.toString(), "text-red-400"],
          ["Warning", warningCount.toString(), "text-gold-400"],
          ["Healthy", healthyCount.toString(), "text-green-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Risk Cards */}
      {risks.length === 0 ? (
        <div className="bg-chamber-900 rounded-xl p-8 border border-chamber-800 text-center text-chamber-500">
          No retention risks found.
        </div>
      ) : (
        <div className="space-y-4">
          {risks.map((r) => {
            const riskColor = r.risk_score >= 80 ? "border-red-400/30" : r.risk_score >= 50 ? "border-gold-400/30" : "border-chamber-800";
            const scoreColor = r.risk_score >= 80 ? "text-red-400" : r.risk_score >= 50 ? "text-gold-400" : "text-green-400";
            return (
              <div key={r.client_id} className={`bg-chamber-900 rounded-xl p-6 border ${riskColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{r.client_name}</h3>
                    <p className="text-sm text-chamber-500">Health: {r.health_score} | Trend: {r.trend}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${scoreColor}`}>{r.risk_score}</p>
                    <span className="text-xs text-chamber-500">Risk Score</span>
                  </div>
                </div>

                {r.risk_factors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-red-400 mb-1">RISK FACTORS</p>
                    <ul className="space-y-1">
                      {r.risk_factors.map((f, i) => (
                        <li key={i} className="text-sm text-chamber-300 pl-3 border-l-2 border-red-400/30">{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {r.recommended_actions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gold-400 mb-1">RECOMMENDED ACTIONS</p>
                    <ul className="space-y-1">
                      {r.recommended_actions.map((a, i) => (
                        <li key={i} className="text-sm text-chamber-300 pl-3 border-l-2 border-gold-400/30">{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
