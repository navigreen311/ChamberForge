"use client";

import { useState, useEffect } from "react";

const initialFlags = [
  { key: "ai_scout_agent", name: "AI Scout Agent", description: "Automated market scanning and problem discovery", enabled: true, tier: "Pro" },
  { key: "ai_analyst_agent", name: "AI Analyst Agent", description: "Evidence validation and scoring", enabled: true, tier: "Pro" },
  { key: "ai_copywriter_agent", name: "AI Copywriter Agent", description: "Marketing copy and outreach generation", enabled: true, tier: "Pro" },
  { key: "persona_simulator", name: "Persona Simulator", description: "AI-simulated buyer conversations for pitch practice", enabled: true, tier: "Enterprise" },
  { key: "scenario_planner", name: "Scenario Planner", description: "Interactive business modeling with live projections", enabled: false, tier: "Enterprise" },
  { key: "household_graph", name: "Household Graph", description: "Visual client relationship mapping", enabled: true, tier: "Pro" },
  { key: "advanced_compliance", name: "Advanced Compliance Suite", description: "Multi-jurisdiction consent and AML screening", enabled: false, tier: "Enterprise" },
  { key: "custom_playbooks", name: "Custom Playbooks", description: "Create and edit custom operational playbooks", enabled: true, tier: "Pro" },
  { key: "api_access", name: "API Access", description: "REST API access for integrations", enabled: false, tier: "Enterprise" },
  { key: "white_label", name: "White Label Mode", description: "Remove ChamberForge branding for client-facing views", enabled: false, tier: "Enterprise" },
  { key: "multi_seat", name: "Multi-Seat Access", description: "Team collaboration with role-based permissions", enabled: true, tier: "Pro" },
  { key: "export_reports", name: "Report Export", description: "Export intel briefs, health reports, and analytics as PDF", enabled: true, tier: "Starter" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function EntitlementsPage() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState(initialFlags);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const toggleFlag = (key: string) => {
    setFlags((prev) => prev.map((f) => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Feature Entitlements</h1>
      <p className="text-chamber-400 mb-8">Enable or disable platform features and manage tier access</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
          <p className="text-chamber-400 text-sm">Enabled</p>
          <p className="text-2xl font-bold text-green-400">{flags.filter(f => f.enabled).length}</p>
        </div>
        <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
          <p className="text-chamber-400 text-sm">Disabled</p>
          <p className="text-2xl font-bold text-chamber-400">{flags.filter(f => !f.enabled).length}</p>
        </div>
        <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
          <p className="text-chamber-400 text-sm">Total Features</p>
          <p className="text-2xl font-bold text-white">{flags.length}</p>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="space-y-3">
        {flags.map((f) => (
          <div key={f.key} className={`bg-chamber-900 rounded-xl p-5 border ${f.enabled ? "border-chamber-800" : "border-chamber-800 opacity-60"} flex items-center justify-between`}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-semibold">{f.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  f.tier === "Starter" ? "bg-chamber-700 text-chamber-300" :
                  f.tier === "Pro" ? "bg-blue-400/20 text-blue-400" :
                  "bg-gold-400/20 text-gold-400"
                }`}>{f.tier}</span>
              </div>
              <p className="text-sm text-chamber-400">{f.description}</p>
            </div>
            <button onClick={() => toggleFlag(f.key)} className={`relative w-12 h-6 rounded-full transition ${f.enabled ? "bg-gold-400" : "bg-chamber-700"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
