"use client";

import { useState, useEffect } from "react";

const playbook = {
  slug: "discovery-to-deal",
  name: "Discovery to Deal",
  description: "A comprehensive 8-step framework that takes you from problem identification through to a signed engagement. Designed for premium service providers targeting HNW/UHNW clients.",
  category: "Sales",
  steps: 8,
  uses: 14,
  status: "Active",
  estimatedTime: "4-6 weeks",
  difficulty: "Intermediate",
  phases: [
    { name: "Problem Validation", desc: "Run the 4-point scorecard on the identified problem", duration: "3-5 days", tools: ["Validation Scorecard", "Evidence Browser"] },
    { name: "Market Sizing", desc: "Quantify the addressable market and revenue potential", duration: "2-3 days", tools: ["Trend Radar", "Revenue Projector"] },
    { name: "ICP Definition", desc: "Build detailed Ideal Client Profile using AI analysis", duration: "1-2 days", tools: ["ICP Builder", "Persona Simulator"] },
    { name: "Offer Creation", desc: "Design the service offering with pricing tiers", duration: "3-5 days", tools: ["Offer Wizard", "Pricing Optimizer"] },
    { name: "Guardrails Check", desc: "Run compliance and ethical review", duration: "1 day", tools: ["Guardrails Check", "Risk Queue"] },
    { name: "Outreach Campaign", desc: "Generate personalized outreach using AI copywriter", duration: "3-5 days", tools: ["Marketing Copy Generator", "Persona Simulator"] },
    { name: "Pipeline Management", desc: "Track and nurture leads through the sales funnel", duration: "Ongoing", tools: ["Pipeline View", "Client Health Monitor"] },
    { name: "Deal Closure", desc: "Finalize terms and onboard the new client", duration: "3-7 days", tools: ["UHNW Onboarding Playbook", "Billing Dashboard"] },
  ],
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function PlaybookDetailPage() {
  const [loading, setLoading] = useState(true);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-full max-w-2xl mb-8" />
        <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build/playbooks" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Playbooks</a>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-white">{playbook.name}</h1>
            <span className="px-2 py-0.5 bg-chamber-800 text-chamber-400 text-xs rounded-full">{playbook.category}</span>
          </div>
          <p className="text-chamber-400 max-w-2xl">{playbook.description}</p>
        </div>
        <button
          onClick={() => setActivated(true)}
          disabled={activated}
          className={`px-5 py-2.5 font-semibold rounded-lg transition ${activated ? "bg-green-400/20 text-green-400 cursor-default" : "bg-gold-400 text-chamber-950 hover:bg-gold-300"}`}
        >{activated ? "Activated" : "Activate Playbook"}</button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Steps", playbook.steps],
          ["Est. Duration", playbook.estimatedTime],
          ["Difficulty", playbook.difficulty],
          ["Times Used", playbook.uses],
        ].map(([l, v]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-4 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className="text-lg font-bold text-white">{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Phases */}
      <h3 className="text-lg font-semibold text-white mb-4">Playbook Phases</h3>
      <div className="space-y-3">
        {playbook.phases.map((phase, idx) => (
          <div key={idx} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-sm font-bold flex-shrink-0">{idx + 1}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-semibold">{phase.name}</h4>
                  <span className="text-xs text-chamber-500">{phase.duration}</span>
                </div>
                <p className="text-sm text-chamber-400 mb-2">{phase.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {phase.tools.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-chamber-800 text-chamber-400 text-xs rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
