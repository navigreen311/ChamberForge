"use client";

import { useState, useEffect } from "react";

const searchResults = [
  { type: "Problem", title: "Private Aviation Charter Gaps", desc: "HNW clients report 3-5 day booking delays for last-minute charter flights", url: "/discover/prob-001", score: 98 },
  { type: "Offer", title: "Private Aviation Concierge", desc: "End-to-end private aviation management for UHNW individuals", url: "/build/offer/off-001", score: 95 },
  { type: "Client", title: "Henderson Family Office", desc: "Platinum tier client — aviation concierge active", url: "/build/household/client-001", score: 88 },
  { type: "Playbook", title: "Discovery to Deal", desc: "End-to-end framework from problem identification to closed deal", url: "/build/playbooks/discovery-to-deal", score: 75 },
  { type: "Evidence", title: "Charter demand up 22% — Knight Frank", desc: "Private aviation demand up 22% among $30M+ net worth", url: "/discover/evidence", score: 72 },
  { type: "Rule", title: "High-Value Lead Detection", desc: "Auto-assign to Scout agent when problem scores 85+", url: "/admin/rules", score: 65 },
];

const filterTypes = ["All", "Problem", "Offer", "Client", "Playbook", "Evidence", "Rule"];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function SearchPage() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("private aviation");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = filterType === "All" ? searchResults : searchResults.filter((r) => r.type === filterType);

  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      Problem: "bg-red-400/20 text-red-400",
      Offer: "bg-green-400/20 text-green-400",
      Client: "bg-blue-400/20 text-blue-400",
      Playbook: "bg-purple-400/20 text-purple-400",
      Evidence: "bg-gold-400/20 text-gold-400",
      Rule: "bg-chamber-700 text-chamber-300",
    };
    return map[type] || "bg-chamber-700 text-chamber-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-12 w-full mb-8" />
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-6">Search</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search problems, offers, clients, playbooks, evidence..."
          className="w-full bg-chamber-900 border border-chamber-700 rounded-lg px-5 py-3.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 transition text-lg"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTypes.map((f) => (
          <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1.5 rounded-lg text-sm transition ${filterType === f ? "bg-gold-400 text-chamber-950 font-semibold" : "bg-chamber-900 text-chamber-400 border border-chamber-700 hover:border-chamber-500"}`}>{f}</button>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-chamber-500 mb-4">{filtered.length} results for &quot;{query}&quot;</p>
      <div className="space-y-3">
        {filtered.map((r, idx) => (
          <a key={idx} href={r.url} className="block bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadge(r.type)}`}>{r.type}</span>
                  <h3 className="text-white font-semibold group-hover:text-gold-400 transition">{r.title}</h3>
                </div>
                <p className="text-sm text-chamber-400">{r.desc}</p>
                <p className="text-xs text-chamber-600 mt-1">{r.url}</p>
              </div>
              <div className="text-right ml-4">
                <span className="text-sm text-chamber-500">Relevance</span>
                <p className="text-gold-400 font-bold">{r.score}%</p>
              </div>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-chamber-500">No results found for this filter. Try a different category.</div>
        )}
      </div>
    </div>
  );
}
