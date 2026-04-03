"use client";

import { useState, useEffect } from "react";

const promptVersions = [
  { id: "v3.2", name: "Scout Market Scanner", model: "claude-opus-4-6", lastUpdated: "2026-04-01", accuracy: 94, latency: "2.8s", cost: "$0.042", status: "active" },
  { id: "v3.1", name: "Scout Market Scanner", model: "claude-opus-4-6", lastUpdated: "2026-03-20", accuracy: 91, latency: "3.1s", cost: "$0.038", status: "archived" },
  { id: "v2.4", name: "Analyst Validator", model: "claude-opus-4-6", lastUpdated: "2026-03-28", accuracy: 89, latency: "4.2s", cost: "$0.065", status: "active" },
  { id: "v1.8", name: "Copywriter Outreach", model: "claude-sonnet-4-20250514", lastUpdated: "2026-03-25", accuracy: 86, latency: "1.4s", cost: "$0.012", status: "active" },
  { id: "v2.1", name: "Compliance Checker", model: "claude-opus-4-6", lastUpdated: "2026-03-30", accuracy: 97, latency: "3.5s", cost: "$0.055", status: "active" },
];

const regressionResults = [
  { test: "Market signal extraction", baseline: 92, current: 94, status: "improved" },
  { test: "Evidence credibility scoring", baseline: 88, current: 89, status: "improved" },
  { test: "ICP generation accuracy", baseline: 85, current: 86, status: "improved" },
  { test: "Outreach tone calibration", baseline: 90, current: 86, status: "regressed" },
  { test: "Compliance flag detection", baseline: 95, current: 97, status: "improved" },
  { test: "Risk score calculation", baseline: 91, current: 91, status: "unchanged" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function EvalLabPage() {
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
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">AI Eval Lab</h1>
      <p className="text-chamber-400 mb-8">Manage prompt versions, run evaluations, and track regressions</p>

      {/* Prompt Versions */}
      <h3 className="text-lg font-semibold text-white mb-4">Prompt Versions</h3>
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Version</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Agent</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Model</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Accuracy</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Latency</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Cost/Call</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {promptVersions.map((v) => (
              <tr key={v.id + v.name} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-gold-400 font-mono text-sm">{v.id}</td>
                <td className="px-5 py-4 text-white text-sm">{v.name}</td>
                <td className="px-5 py-4 text-chamber-400 text-xs font-mono">{v.model}</td>
                <td className="px-5 py-4">
                  <span className={`font-bold ${v.accuracy >= 90 ? "text-green-400" : "text-gold-400"}`}>{v.accuracy}%</span>
                </td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{v.latency}</td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{v.cost}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${v.status === "active" ? "bg-green-400/20 text-green-400" : "bg-chamber-700 text-chamber-400"}`}>{v.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Regression Results */}
      <h3 className="text-lg font-semibold text-white mb-4">Regression Test Results</h3>
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Test Case</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Baseline</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Current</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Delta</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {regressionResults.map((r) => {
              const delta = r.current - r.baseline;
              return (
                <tr key={r.test} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-5 py-4 text-white text-sm">{r.test}</td>
                  <td className="px-5 py-4 text-chamber-400 text-sm">{r.baseline}%</td>
                  <td className="px-5 py-4 text-white font-medium text-sm">{r.current}%</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-medium ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-chamber-400"}`}>
                      {delta > 0 ? `+${delta}` : delta === 0 ? "0" : delta}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === "improved" ? "bg-green-400/20 text-green-400" :
                      r.status === "regressed" ? "bg-red-400/20 text-red-400" :
                      "bg-chamber-700 text-chamber-400"
                    }`}>{r.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
