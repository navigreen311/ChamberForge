"use client";

import { useState, useEffect } from "react";

const playbooks = [
  { slug: "discovery-to-deal", name: "Discovery to Deal", desc: "End-to-end framework from problem identification to closed deal", category: "Sales", uses: 14, steps: 8, status: "Active" },
  { slug: "uhnw-onboarding", name: "UHNW Client Onboarding", desc: "White-glove onboarding process for ultra-high-net-worth clients", category: "Operations", uses: 9, steps: 12, status: "Active" },
  { slug: "retention-playbook", name: "Client Retention", desc: "Proactive retention strategies based on health score triggers", category: "Lifecycle", uses: 22, steps: 6, status: "Active" },
  { slug: "market-entry", name: "New Market Entry", desc: "Systematic approach to entering a new premium service vertical", category: "Strategy", uses: 5, steps: 10, status: "Active" },
  { slug: "crisis-management", name: "Client Crisis Management", desc: "Rapid response framework for service failures or client emergencies", category: "Operations", uses: 3, steps: 7, status: "Active" },
  { slug: "pricing-optimization", name: "Pricing Optimization", desc: "Data-driven approach to optimizing service pricing tiers", category: "Strategy", uses: 7, steps: 5, status: "Active" },
  { slug: "referral-engine", name: "Referral Engine", desc: "Structured referral program for HNW client acquisition", category: "Sales", uses: 11, steps: 6, status: "Active" },
  { slug: "compliance-audit", name: "Compliance Audit", desc: "Quarterly compliance review and documentation workflow", category: "Compliance", uses: 4, steps: 9, status: "Draft" },
  { slug: "team-scaling", name: "Team Scaling", desc: "Framework for scaling service delivery teams while maintaining quality", category: "Operations", uses: 2, steps: 8, status: "Draft" },
  { slug: "exit-strategy", name: "Client Exit & Transition", desc: "Graceful offboarding and knowledge transfer process", category: "Lifecycle", uses: 1, steps: 5, status: "Active" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function PlaybooksPage() {
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Playbook Gallery</h1>
      <p className="text-chamber-400 mb-8">Proven frameworks for every stage of premium service delivery</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playbooks.map((p) => (
          <a key={p.slug} href={`/build/playbooks/${p.slug}`} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-chamber-800 text-chamber-400 text-xs rounded-full">{p.category}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "Active" ? "bg-green-400/20 text-green-400" : "bg-chamber-700 text-chamber-400"}`}>{p.status}</span>
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-gold-400 transition">{p.name}</h3>
            <p className="text-sm text-chamber-400 mb-4">{p.desc}</p>
            <div className="flex items-center justify-between text-xs text-chamber-500">
              <span>{p.steps} steps</span>
              <span>{p.uses} times used</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
