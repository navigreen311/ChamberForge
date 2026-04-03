"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

interface SearchResult {
  id: string;
  index: string;
  score: number;
  title?: string;
  name?: string;
  highlight?: Record<string, string[]>;
  [key: string]: unknown;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  size: number;
}

const FACETS = {
  index: [
    { value: "all", label: "All" },
    { value: "problems", label: "Problems" },
    { value: "evidence", label: "Evidence" },
    { value: "offers", label: "Offers" },
    { value: "clients", label: "Clients" },
    { value: "partners", label: "Partners" },
    { value: "experts", label: "Experts" },
  ],
  wealth_tier: [
    { value: "", label: "Any Tier" },
    { value: "hnw", label: "HNW" },
    { value: "uhnw", label: "UHNW" },
    { value: "mass_affluent", label: "Mass Affluent" },
  ],
  status: [
    { value: "", label: "Any Status" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ],
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState("all");
  const [wealthTier, setWealthTier] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const SIZE = 20;

  const doSearch = useCallback(
    async (p: number = 1) => {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (wealthTier) filters.wealth_tier = wealthTier;
      if (status) filters.status = status;

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const params = new URLSearchParams({
        q: query,
        index,
        page: String(p),
        size: String(SIZE),
        filters: JSON.stringify(filters),
      });

      try {
        const res = await fetch(`${apiBase}/api/v1/search/?${params}`);
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResponse(data);
          setPage(p);
        }
      } catch {
        setResponse({ results: [], total: 0, page: p, size: SIZE });
      } finally {
        setLoading(false);
      }
    },
    [query, index, wealthTier, status]
  );

  // Search on facet change
  useEffect(() => {
    if (query) doSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, wealthTier, status]);

  const totalPages = response ? Math.ceil(response.total / SIZE) : 0;

  const displayName = (r: SearchResult) => r.title || r.name || r.id;

  const snippet = (r: SearchResult): string | null => {
    if (!r.highlight) return null;
    const first = Object.values(r.highlight)[0];
    return first?.[0] ?? null;
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10">
      {/* Sidebar facets */}
      <aside className="hidden w-56 shrink-0 space-y-6 md:block">
        <FacetGroup
          title="Type"
          options={FACETS.index}
          value={index}
          onChange={setIndex}
        />
        <FacetGroup
          title="Wealth Tier"
          options={FACETS.wealth_tier}
          value={wealthTier}
          onChange={setWealthTier}
        />
        <FacetGroup
          title="Status"
          options={FACETS.status}
          value={status}
          onChange={setStatus}
        />
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Search bar */}
        <form
          className="mb-6 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            doSearch(1);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across the platform..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && response && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {response.total} result{response.total !== 1 ? "s" : ""} found
            </p>

            <ul className="space-y-3">
              {response.results.map((r) => {
                const hl = snippet(r);
                return (
                  <li
                    key={`${r.index}-${r.id}`}
                    className="rounded-lg border border-gray-200 p-4 hover:shadow dark:border-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500 dark:bg-gray-800">
                        {r.index.replace("chamberforge_", "")}
                      </span>
                      <span className="text-xs text-gray-400">
                        score: {r.score?.toFixed(2)}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {displayName(r)}
                    </h3>
                    {hl && (
                      <p
                        className="mt-0.5 text-xs text-gray-500 [&>mark]:bg-yellow-200 [&>mark]:px-0.5"
                        dangerouslySetInnerHTML={{ __html: hl }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => doSearch(page - 1)}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => doSearch(page + 1)}
                  className="rounded border px-3 py-1 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── FacetGroup component ────────────────────────────────────────── */

function FacetGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {title}
      </h4>
      <ul className="space-y-1">
        {options.map((opt) => (
          <li key={opt.value}>
            <button
              onClick={() => onChange(opt.value)}
              className={clsx(
                "w-full rounded px-2 py-1 text-left text-sm",
                value === opt.value
                  ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
