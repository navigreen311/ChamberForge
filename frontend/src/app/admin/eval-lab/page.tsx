"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface PromptVersion {
  version: string;
  agent_name: string;
  model: string;
  updated_at: string;
  accuracy?: number;
  latency?: string;
  cost_per_call?: string;
  status: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

const AGENTS = ["scout", "analyst", "copywriter", "compliance", "monitor"];

export default function EvalLabPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null);
  const [rollbackMsg, setRollbackMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVersions() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/v1/admin/prompts/${selectedAgent}`);
        setVersions(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load prompt versions");
        setVersions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVersions();
  }, [selectedAgent]);

  const handleRollback = async (version: string) => {
    setRollbackLoading(version);
    setRollbackMsg(null);
    try {
      await api.post(`/api/v1/admin/prompts/${selectedAgent}/rollback/${version}`);
      setRollbackMsg(`Successfully rolled back ${selectedAgent} to ${version}`);
      // Refresh versions
      const res = await api.get(`/api/v1/admin/prompts/${selectedAgent}`);
      setVersions(res.data);
    } catch (err: any) {
      setRollbackMsg(`Rollback failed: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setRollbackLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">AI Eval Lab</h1>
      <p className="text-chamber-400 mb-8">Manage prompt versions, run evaluations, and rollback</p>

      {/* Agent selector */}
      <div className="flex gap-2 mb-6">
        {AGENTS.map((agent) => (
          <button
            key={agent}
            onClick={() => setSelectedAgent(agent)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              selectedAgent === agent
                ? "bg-gold-400 text-chamber-950 font-semibold"
                : "bg-chamber-800 text-chamber-400 hover:text-white"
            }`}
          >
            {agent}
          </button>
        ))}
      </div>

      {rollbackMsg && (
        <div className={`rounded-xl p-4 mb-6 ${rollbackMsg.includes("failed") ? "bg-red-400/10 border border-red-400/30 text-red-400" : "bg-green-400/10 border border-green-400/30 text-green-400"}`}>
          {rollbackMsg}
        </div>
      )}

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400 mb-6">{error}</div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : versions.length === 0 ? (
        <div className="bg-chamber-900 rounded-xl p-8 border border-chamber-800 text-center text-chamber-500">
          No prompt versions found for {selectedAgent}.
        </div>
      ) : (
        <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
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
                <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.version} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-5 py-4 text-gold-400 font-mono text-sm">{v.version}</td>
                  <td className="px-5 py-4 text-white text-sm capitalize">{v.agent_name}</td>
                  <td className="px-5 py-4 text-chamber-400 text-xs font-mono">{v.model}</td>
                  <td className="px-5 py-4">
                    {v.accuracy != null ? (
                      <span className={`font-bold ${v.accuracy >= 90 ? "text-green-400" : "text-gold-400"}`}>{v.accuracy}%</span>
                    ) : <span className="text-chamber-500">--</span>}
                  </td>
                  <td className="px-5 py-4 text-chamber-300 text-sm">{v.latency || "--"}</td>
                  <td className="px-5 py-4 text-chamber-300 text-sm">{v.cost_per_call || "--"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${v.status === "active" ? "bg-green-400/20 text-green-400" : "bg-chamber-700 text-chamber-400"}`}>{v.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {v.status !== "active" && (
                      <button
                        onClick={() => handleRollback(v.version)}
                        disabled={rollbackLoading === v.version}
                        className="px-3 py-1 bg-gold-400/20 text-gold-400 text-xs rounded-lg hover:bg-gold-400/30 transition disabled:opacity-50"
                      >
                        {rollbackLoading === v.version ? "..." : "Rollback"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
