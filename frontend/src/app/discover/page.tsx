"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";

const filterConfig = [
  { label: "Category", key: "category", options: ["All", "Concierge", "Estate", "Aviation", "Marine", "Finance", "Staffing"] },
  { label: "Lifecycle", key: "lifecycle", options: ["All", "Emerging", "Growing", "Mature", "Declining"] },
  { label: "Urgency", key: "urgency", options: ["All", "Critical", "High", "Medium", "Low"] },
];

interface Problem {
  id: string;
  title: string;
  category: string;
  lifecycle: string;
  urgency: string;
  score: number;
  evidence_count?: number;
  evidence?: number;
  description?: string;
  desc?: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function DiscoverPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [scanning, setScanning] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProblems = useCallback(async (query: string, filters: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (query) params.search = query;
      for (const f of filterConfig) {
        const val = filters[f.label];
        if (val && val !== "All") params[f.key] = val;
      }
      const res = await api.get("/api/v1/problems", { params });
      const data = res.data;
      setProblems(Array.isArray(data) ? data : data.items ?? data.results ?? []);
      setTotalCount(Array.isArray(data) ? data.length : data.total ?? data.count ?? (data.items ?? data.results ?? []).length);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems(search, activeFilters);
  }, [activeFilters, fetchProblems]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProblems(search, activeFilters);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const handleScan = async () => {
    try {
      setScanning(true);
      await api.post("/api/v1/discovery/scan", { sources: ["market_reports", "forums", "news"] });
      // Refresh the list after scan
      await fetchProblems(search, activeFilters);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  if (loading && problems.length === 0) {
    return (
      <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-full max-w-96 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-48 lg:h-96" />
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">Problem Discovery</h1>
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

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

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
        {/* Filter Sidebar — horizontal on mobile, vertical sidebar on lg+ */}
        <div className="space-y-4 lg:space-y-6">
          <h3 className="text-sm font-semibold text-chamber-400 uppercase tracking-wider">Filters</h3>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
            {filterConfig.map((f) => (
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
          </div>
          <div className="pt-4 border-t border-chamber-800">
            <p className="text-xs text-chamber-500">Showing {problems.length} of {totalCount} problems</p>
          </div>
        </div>

        {/* Problem Card Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && (
            <>
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-44" />)}
            </>
          )}
          {!loading && problems.map((p) => (
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
              <p className="text-sm text-chamber-400 mb-3">{p.description ?? p.desc}</p>
              <div className="flex items-center justify-between text-xs text-chamber-500">
                <span>{p.category}</span>
                <span>{p.evidence_count ?? p.evidence ?? 0} evidence points</span>
                <div className="flex items-center gap-1">
                  <span>Score:</span>
                  <span className="text-gold-400 font-semibold">{p.score}</span>
                </div>
              </div>
            </a>
          ))}
          {!loading && problems.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-chamber-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-chamber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No problems discovered yet</h3>
              <p className="text-chamber-400 mb-6 max-w-sm">Run an AI scan to get started. ChamberForge will analyze market signals to find high-value problems.</p>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center gap-2"
              >
                {scanning && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
                {scanning ? "Scanning..." : "Run AI Scan"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
