"use client";

import { useState, useEffect } from "react";

const filters = [
  { label: "Category", options: ["All", "Concierge", "Estate", "Aviation", "Marine", "Finance", "Staffing"] },
  { label: "Lifecycle", options: ["All", "Emerging", "Growing", "Mature", "Declining"] },
  { label: "Urgency", options: ["All", "Critical", "High", "Medium", "Low"] },
];

const problems = [
  { id: "prob-001", title: "Private Aviation Charter Gaps", category: "Aviation", lifecycle: "Growing", urgency: "High", score: 91, evidence: 14, desc: "HNW clients report 3-5 day booking delays for last-minute charter flights." },
  { id: "prob-002", title: "Estate Staff Retention Crisis", category: "Staffing", lifecycle: "Emerging", urgency: "Critical", score: 87, evidence: 22, desc: "Annual turnover for estate managers exceeds 40% in top metro areas." },
  { id: "prob-003", title: "Family Office Tax Complexity", category: "Finance", lifecycle: "Mature", urgency: "Medium", score: 78, evidence: 9, desc: "Multi-jurisdictional tax reporting errors cost families $50K+ annually." },
  { id: "prob-004", title: "Yacht Crew Credentialing", category: "Marine", lifecycle: "Growing", urgency: "High", score: 84, evidence: 11, desc: "No centralized system for STCW certification tracking across fleet crews." },
  { id: "prob-005", title: "Concierge Service Fragmentation", category: "Concierge", lifecycle: "Emerging", urgency: "High", score: 89, evidence: 17, desc: "Average UHNW household uses 7+ disconnected concierge providers." },
  { id: "prob-006", title: "Art Collection Insurance Gaps", category: "Finance", lifecycle: "Growing", urgency: "Medium", score: 72, evidence: 6, desc: "30% of private collections are underinsured due to outdated appraisals." },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function DiscoverPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = problems.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilters.Category && activeFilters.Category !== "All" && p.category !== activeFilters.Category) return false;
    if (activeFilters.Lifecycle && activeFilters.Lifecycle !== "All" && p.lifecycle !== activeFilters.Lifecycle) return false;
    if (activeFilters.Urgency && activeFilters.Urgency !== "All" && p.urgency !== activeFilters.Urgency) return false;
    return true;
  });

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-6">
          <Skeleton className="h-96" />
          <div className="col-span-3 grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Problem Discovery</h1>
          <p className="text-chamber-400">Find high-value problems in the premium services market</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center gap-2"
        >
          {scanning && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
          {scanning ? "Scanning..." : "Run AI Scan"}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search problems by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-chamber-900 border border-chamber-700 rounded-lg px-4 py-3 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 transition"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider">Filters</h3>
          {filters.map((f) => (
            <div key={f.label}>
              <label className="text-sm text-chamber-300 mb-2 block">{f.label}</label>
              <select
                value={activeFilters[f.label] || "All"}
                onChange={(e) => setActiveFilters((p) => ({ ...p, [f.label]: e.target.value }))}
                className="w-full bg-chamber-900 border border-chamber-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold-400"
              >
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="pt-4 border-t border-chamber-800">
            <p className="text-xs text-chamber-500">Showing {filtered.length} of {problems.length} problems</p>
          </div>
        </div>

        {/* Problem Card Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <a key={p.id} href={`/discover/${p.id}`} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition group">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.urgency === "Critical" ? "bg-red-400/20 text-red-400" :
                  p.urgency === "High" ? "bg-orange-400/20 text-orange-400" :
                  "bg-blue-400/20 text-blue-400"
                }`}>{p.urgency}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  p.lifecycle === "Emerging" ? "bg-green-400/20 text-green-400" :
                  p.lifecycle === "Growing" ? "bg-gold-400/20 text-gold-400" :
                  "bg-chamber-700 text-chamber-300"
                }`}>{p.lifecycle}</span>
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-gold-400 transition">{p.title}</h3>
              <p className="text-sm text-chamber-400 mb-3">{p.desc}</p>
              <div className="flex items-center justify-between text-xs text-chamber-500">
                <span>{p.category}</span>
                <span>{p.evidence} evidence points</span>
                <div className="flex items-center gap-1">
                  <span>Score:</span>
                  <span className="text-gold-400 font-semibold">{p.score}</span>
                </div>
              </div>
            </a>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-chamber-500">
              No problems match your filters. Try adjusting your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
