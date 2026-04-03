"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";

interface SearchResult {
  type: string;
  title: string;
  description: string;
  url: string;
  score: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  size: number;
}

const indexOptions = [
  { value: "all", label: "All" },
  { value: "problems", label: "Problems" },
  { value: "evidence", label: "Evidence" },
  { value: "offers", label: "Offers" },
  { value: "clients", label: "Clients" },
];

const PAGE_SIZE = 20;

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    Problem: "bg-red-400/20 text-red-400",
    problem: "bg-red-400/20 text-red-400",
    Offer: "bg-green-400/20 text-green-400",
    offer: "bg-green-400/20 text-green-400",
    Client: "bg-blue-400/20 text-blue-400",
    client: "bg-blue-400/20 text-blue-400",
    Playbook: "bg-purple-400/20 text-purple-400",
    playbook: "bg-purple-400/20 text-purple-400",
    Evidence: "bg-gold-400/20 text-gold-400",
    evidence: "bg-gold-400/20 text-gold-400",
  };
  return map[type] || "bg-chamber-700 text-chamber-400";
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState("all");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string, idx: string, pg: number) => {
      if (!q.trim()) {
        setResults([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<SearchResponse>("/api/v1/search", {
          params: { q, index: idx, page: pg, size: PAGE_SIZE },
        });
        setResults(res.data?.results ?? []);
        setTotal(res.data?.total ?? 0);
      } catch (err: any) {
        setError(err?.message || "Search failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search on query/index change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, index, 1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, index, doSearch]);

  // Immediate search on page change (not debounced)
  useEffect(() => {
    if (page > 1) {
      doSearch(query, index, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-6">
        Search
      </h1>

      {/* Search Bar */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search problems, offers, clients, evidence..."
          className="flex-1 bg-chamber-900 border border-chamber-700 rounded-lg px-5 py-3.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 transition text-lg"
        />
        <select
          value={index}
          onChange={(e) => setIndex(e.target.value)}
          className="bg-chamber-900 border border-chamber-700 rounded-lg px-4 py-3 text-chamber-300 focus:outline-none focus:border-gold-400 transition"
        >
          {indexOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          {query.trim() && (
            <p className="text-sm text-chamber-500 mb-4">
              {total} result{total !== 1 ? "s" : ""} for &quot;{query}&quot;
            </p>
          )}
          <div className="space-y-3">
            {results.map((r, idx) => (
              <a
                key={idx}
                href={r.url}
                className="block bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadge(r.type)}`}
                      >
                        {r.type}
                      </span>
                      <h3 className="text-white font-semibold group-hover:text-gold-400 transition">
                        {r.title}
                      </h3>
                    </div>
                    <p className="text-sm text-chamber-400">{r.description}</p>
                    <p className="text-xs text-chamber-600 mt-1">{r.url}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm text-chamber-500">Relevance</span>
                    <p className="text-gold-400 font-bold">{r.score}%</p>
                  </div>
                </div>
              </a>
            ))}
            {!loading && results.length === 0 && query.trim() && (
              <div className="text-center py-16 text-chamber-500">
                No results found. Try a different search term or index.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-chamber-700 text-chamber-300 text-sm hover:border-chamber-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-chamber-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-chamber-700 text-chamber-300 text-sm hover:border-chamber-500 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
