"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

interface ScorecardItem {
  title: string;
  description: string;
  score: number;
  evidence: string[];
  verdict: string;
}

interface ValidationResult {
  problem_title?: string;
  problem_name?: string;
  overall_score?: number;
  scorecard?: ScorecardItem[];
  items?: ScorecardItem[];
  scores?: ScorecardItem[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function ValidationScorecardPage() {
  const params = useParams();
  const problemId = params?.problemId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (!problemId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.post(`/api/v1/qualify/validate/${problemId}`);
        setData(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? err.message ?? "Validation failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [problemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/qualify" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Qualify</a>
        <div className="p-6 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400">
          {error ?? "No validation data returned"}
        </div>
      </div>
    );
  }

  const scorecardItems = data.scorecard ?? data.items ?? data.scores ?? [];
  const overallScore = data.overall_score ?? (scorecardItems.length > 0
    ? Math.round(scorecardItems.reduce((acc, s) => acc + s.score, 0) / scorecardItems.length)
    : 0);
  const problemTitle = data.problem_title ?? data.problem_name ?? problemId;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/qualify" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Qualify</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">4-Point Validation Scorecard</h1>
      <p className="text-chamber-400 mb-8">{problemTitle}</p>

      {/* Overall Score */}
      <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 mb-8 flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#243b53" strokeWidth="10" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={overallScore >= 80 ? "#4ade80" : overallScore >= 60 ? "#fbbf24" : "#f87171"} strokeWidth="10" strokeDasharray={`${overallScore * 3.14} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{overallScore}</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Overall: {overallScore >= 80 ? "Qualified" : overallScore >= 60 ? "Needs Review" : "Not Qualified"}</h2>
          <p className="text-chamber-400">
            {overallScore >= 80
              ? "This problem passes validation with strong market signals and feasibility."
              : overallScore >= 60
                ? "This problem shows potential but requires further review."
                : "This problem does not currently meet qualification thresholds."}
          </p>
          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Proceed to Build</button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition"
            >
              Re-evaluate
            </button>
          </div>
        </div>
      </div>

      {/* Scorecard Items */}
      <div className="space-y-4">
        {scorecardItems.map((item, idx) => (
          <div key={idx} className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold text-gold-400">#{idx + 1}</span>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                </div>
                <p className="text-sm text-chamber-400">{item.description}</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${item.score >= 80 ? "text-green-400" : item.score >= 60 ? "text-gold-400" : "text-red-400"}`}>{item.score}</span>
                <p className={`text-xs font-medium ${item.verdict === "Strong" ? "text-green-400" : item.verdict === "Moderate" ? "text-gold-400" : "text-red-400"}`}>{item.verdict}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-chamber-800 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full ${item.score >= 80 ? "bg-green-400" : item.score >= 60 ? "bg-gold-400" : "bg-red-400"}`} style={{ width: `${item.score}%` }} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-chamber-500 uppercase tracking-wider">Supporting Evidence</p>
              {(item.evidence ?? []).map((e, i) => (
                <p key={i} className="text-sm text-chamber-300 pl-3 border-l-2 border-chamber-700">{e}</p>
              ))}
            </div>
          </div>
        ))}
        {scorecardItems.length === 0 && (
          <div className="text-center py-8 text-chamber-500">No scorecard items returned.</div>
        )}
      </div>
    </div>
  );
}
