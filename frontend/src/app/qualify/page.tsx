"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Validation {
  id: number | string;
  problem: string;
  problem_title?: string;
  score: number;
  date: string;
  created_at?: string;
  status: string;
}

const quickActions = [
  { title: "Validate a Problem", desc: "Run the 4-point validation scorecard on a discovered problem", href: "/discover", icon: "\uD83C\uDFAF" },
  { title: "Build Buyer Profile", desc: "Create an Ideal Client Profile for your target market", href: "/qualify/buyer-profile", icon: "\uD83D\uDC64" },
  { title: "Run Guardrails Check", desc: "Verify ethical and compliance guardrails before proceeding", href: "/qualify/guardrails", icon: "\uD83D\uDEE1\uFE0F" },
  { title: "Review Risk Queue", desc: "Approve or reject flagged items requiring human review", href: "/qualify/risk-queue", icon: "\u26A0\uFE0F" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function QualifyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [counts, setCounts] = useState({ problems: 0, validations: 0, riskQueue: 0, profiles: 0 });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch summary counts and recent validations in parallel
        const results = await Promise.allSettled([
          api.get("/api/v1/problems", { params: { limit: 1 } }),
          api.get("/api/v1/qualify/validations", { params: { limit: 5 } }),
          api.get("/api/v1/qualify/risk-queue"),
          api.get("/api/v1/qualify/buyer-profiles", { params: { limit: 1 } }),
        ]);

        // Problems count
        if (results[0].status === "fulfilled") {
          const d = results[0].value.data;
          setCounts((prev) => ({ ...prev, problems: d.total ?? d.count ?? (Array.isArray(d) ? d.length : 0) }));
        }

        // Validations
        if (results[1].status === "fulfilled") {
          const d = results[1].value.data;
          const items: Validation[] = Array.isArray(d) ? d : d.items ?? d.results ?? [];
          setValidations(items.slice(0, 5));
          setCounts((prev) => ({ ...prev, validations: d.total ?? d.count ?? items.length }));
        }

        // Risk queue count
        if (results[2].status === "fulfilled") {
          const d = results[2].value.data;
          const items = Array.isArray(d) ? d : d.items ?? d.results ?? [];
          const pendingCount = Array.isArray(items) ? items.filter((i: any) => i.status === "pending").length : d.total ?? d.count ?? 0;
          setCounts((prev) => ({ ...prev, riskQueue: pendingCount }));
        }

        // Buyer profiles count
        if (results[3].status === "fulfilled") {
          const d = results[3].value.data;
          setCounts((prev) => ({ ...prev, profiles: d.total ?? d.count ?? (Array.isArray(d) ? d.length : 0) }));
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? err.message ?? "Failed to load qualify data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Qualify Hub</h1>
      <p className="text-chamber-400 mb-8">Validate problems, build buyer profiles, and ensure quality guardrails</p>

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((a) => (
          <a key={a.title} href={a.href} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition group">
            <span className="text-2xl mb-3 block">{a.icon}</span>
            <h3 className="text-white font-semibold mb-1 group-hover:text-gold-400 transition">{a.title}</h3>
            <p className="text-sm text-chamber-400">{a.desc}</p>
          </a>
        ))}
      </div>

      {/* Recent Validations */}
      <h3 className="text-lg font-semibold text-white mb-4">Recent Validations</h3>
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Problem</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Score</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {validations.map((v) => (
              <tr key={v.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium">{v.problem ?? v.problem_title}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-chamber-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${v.score >= 80 ? "bg-green-400" : v.score >= 60 ? "bg-gold-400" : "bg-red-400"}`} style={{ width: `${v.score}%` }} />
                    </div>
                    <span className="text-sm text-chamber-300">{v.score}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    v.status === "Passed" ? "bg-green-400/20 text-green-400" :
                    v.status === "Review" ? "bg-gold-400/20 text-gold-400" :
                    "bg-red-400/20 text-red-400"
                  }`}>{v.status}</span>
                </td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{v.date ?? v.created_at}</td>
                <td className="px-5 py-4">
                  <a href={`/qualify/validate/${v.id}`} className="text-gold-400 text-sm hover:underline">View</a>
                </td>
              </tr>
            ))}
            {validations.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-chamber-500">No validations yet. Start by validating a discovered problem.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
