"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface EvidenceItem {
  id: number | string;
  type: string;
  source: string;
  credibility: number;
  credibility_score?: number;
  summary: string;
  date: string;
  publication_date?: string;
}

interface ProblemDetail {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  lifecycle: string;
  urgency: number;
  description: string;
  target_market?: string;
  targetMarket?: string;
  market_size?: string;
  marketSize?: string;
  growth_rate?: string;
  growthRate?: string;
  pain_intensity?: string;
  painIntensity?: string;
  willingness_to_pay?: string;
  willingnessToPay?: string;
  competitive_landscape?: string;
  competitiveLandscape?: string;
  regulatory_notes?: string;
  regulatoryNotes?: string;
  tags: string[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  evidence: EvidenceItem[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function ProblemDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [problem, setProblem] = useState<ProblemDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/v1/problems/${id}`);
        setProblem(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? err.message ?? "Failed to load problem");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-8 w-96 mb-4" />
        <Skeleton className="h-5 w-full max-w-2xl mb-8" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/discover" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Discovery</a>
        <div className="p-6 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400">
          {error ?? "Problem not found"}
        </div>
      </div>
    );
  }

  const evidenceList = problem.evidence ?? [];
  const urgencyScore = problem.urgency ?? 0;
  const createdAt = problem.created_at ?? problem.createdAt ?? "—";
  const updatedAt = problem.updated_at ?? problem.updatedAt ?? "—";
  const marketSize = problem.market_size ?? problem.marketSize ?? "—";
  const growthRate = problem.growth_rate ?? problem.growthRate ?? "—";

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/discover" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Discovery</a>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">{problem.title}</h1>
          <p className="text-chamber-400 max-w-2xl">{problem.description}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/qualify/validate/${problem.id}`} className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Validate</a>
          <button className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition">Export</button>
        </div>
      </div>

      {/* Tags + Lifecycle Badge */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className="px-3 py-1 bg-green-400/20 text-green-400 text-sm rounded-full font-medium">{problem.lifecycle}</span>
        {(problem.tags ?? []).map((t) => (
          <span key={t} className="px-3 py-1 bg-chamber-800 text-chamber-300 text-sm rounded-full">#{t}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ontology Fields */}
          <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
            <h3 className="text-lg font-semibold text-white mb-4">Problem Ontology</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Category", problem.category],
                ["Subcategory", problem.subcategory ?? "—"],
                ["Target Market", problem.target_market ?? problem.targetMarket ?? "—"],
                ["Market Size", marketSize],
                ["Growth Rate", growthRate],
                ["Pain Intensity", problem.pain_intensity ?? problem.painIntensity ?? "—"],
                ["Willingness to Pay", problem.willingness_to_pay ?? problem.willingnessToPay ?? "—"],
                ["Competitive Landscape", problem.competitive_landscape ?? problem.competitiveLandscape ?? "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-chamber-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-white text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-chamber-800">
              <p className="text-xs text-chamber-500 uppercase tracking-wider mb-1">Regulatory Notes</p>
              <p className="text-white text-sm">{problem.regulatory_notes ?? problem.regulatoryNotes ?? "—"}</p>
            </div>
          </div>

          {/* Evidence List */}
          <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Evidence ({evidenceList.length})</h3>
              <a href="/discover/evidence" className="text-gold-400 text-sm hover:underline">View all evidence &rarr;</a>
            </div>
            <div className="space-y-3">
              {evidenceList.map((e) => (
                <div key={e.id} className="flex items-start gap-4 p-3 rounded-lg bg-chamber-800/50">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    e.type === "Data" ? "bg-blue-400/20 text-blue-400" :
                    e.type === "Survey" ? "bg-purple-400/20 text-purple-400" :
                    e.type === "Interview" ? "bg-green-400/20 text-green-400" :
                    e.type === "Report" ? "bg-gold-400/20 text-gold-400" :
                    "bg-chamber-700 text-chamber-300"
                  }`}>{e.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{e.summary}</p>
                    <p className="text-xs text-chamber-500 mt-1">{e.source} &middot; {e.date ?? e.publication_date}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-1.5 bg-chamber-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full" style={{ width: `${e.credibility ?? e.credibility_score ?? 0}%` }} />
                    </div>
                    <span className="text-xs text-chamber-500">{e.credibility ?? e.credibility_score ?? 0}%</span>
                  </div>
                </div>
              ))}
              {evidenceList.length === 0 && (
                <p className="text-sm text-chamber-500 text-center py-4">No evidence linked yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Urgency Gauge */}
          <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 text-center">
            <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider mb-4">Urgency Score</h3>
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#243b53" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke="#fbbf24" strokeWidth="10"
                  strokeDasharray={`${urgencyScore * 3.14} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gold-400">{urgencyScore}</span>
              </div>
            </div>
            <p className="text-chamber-400 text-sm">
              {urgencyScore >= 80 ? "High urgency — act within 30 days" : urgencyScore >= 50 ? "Moderate urgency" : "Low urgency"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 space-y-4">
            <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider">Quick Stats</h3>
            {[
              ["Created", createdAt],
              ["Last Updated", updatedAt],
              ["Evidence Points", String(evidenceList.length)],
              ["Market Size", marketSize],
              ["Growth", growthRate],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-sm text-chamber-500">{l}</span>
                <span className="text-sm text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
