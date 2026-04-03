"use client";

import { useState, useEffect } from "react";

const recentValidations = [
  { id: 1, problem: "Private Aviation Charter Gaps", score: 92, date: "2026-04-01", status: "Passed" },
  { id: 2, problem: "Estate Staff Retention Crisis", score: 87, date: "2026-03-30", status: "Passed" },
  { id: 3, problem: "Yacht Crew Credentialing", score: 71, date: "2026-03-28", status: "Review" },
  { id: 4, problem: "Art Collection Insurance Gaps", score: 58, date: "2026-03-25", status: "Failed" },
  { id: 5, problem: "Concierge Service Fragmentation", score: 89, date: "2026-03-22", status: "Passed" },
];

const quickActions = [
  { title: "Validate a Problem", desc: "Run the 4-point validation scorecard on a discovered problem", href: "/discover", icon: "🎯" },
  { title: "Build Buyer Profile", desc: "Create an Ideal Client Profile for your target market", href: "/qualify/buyer-profile", icon: "👤" },
  { title: "Run Guardrails Check", desc: "Verify ethical and compliance guardrails before proceeding", href: "/qualify/guardrails", icon: "🛡️" },
  { title: "Review Risk Queue", desc: "Approve or reject flagged items requiring human review", href: "/qualify/risk-queue", icon: "⚠️" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function QualifyPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
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
            {recentValidations.map((v) => (
              <tr key={v.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium">{v.problem}</td>
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
                <td className="px-5 py-4 text-chamber-400 text-sm">{v.date}</td>
                <td className="px-5 py-4">
                  <a href={`/qualify/validate/${v.id}`} className="text-gold-400 text-sm hover:underline">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
