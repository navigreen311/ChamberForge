"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, FileText, BarChart3, Package, Users, Handshake, GraduationCap } from "lucide-react";
import clsx from "clsx";

interface SearchResult {
  id: string;
  index: string;
  score: number;
  title?: string;
  name?: string;
  description?: string;
  highlight?: Record<string, string[]>;
  [key: string]: unknown;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  size: number;
}

const INDEX_META: Record<string, { label: string; icon: React.ElementType; href: string }> = {
  chamberforge_problems: { label: "Problems", icon: FileText, href: "/problems" },
  chamberforge_evidence: { label: "Evidence", icon: BarChart3, href: "/evidence" },
  chamberforge_offers: { label: "Offers", icon: Package, href: "/offers" },
  chamberforge_clients: { label: "Clients", icon: Users, href: "/clients" },
  chamberforge_partners: { label: "Partners", icon: Handshake, href: "/partners" },
  chamberforge_experts: { label: "Experts", icon: GraduationCap, href: "/experts" },
};

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          /* parent controls open state — this component doesn't toggle itself */
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(
        `${apiBase}/api/v1/search/?q=${encodeURIComponent(q)}&index=all&size=30`
      );
      if (res.ok) {
        setResults(await res.json());
      }
    } catch {
      /* ES may be down — silently degrade */
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  // Group results by index
  const grouped: Record<string, SearchResult[]> = {};
  if (results?.results) {
    for (const r of results.results) {
      const key = r.index;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }
  }

  const displayName = (r: SearchResult) =>
    r.title || r.name || r.id;

  const highlightSnippet = (r: SearchResult): string | null => {
    if (!r.highlight) return null;
    const first = Object.values(r.highlight)[0];
    return first?.[0] ?? null;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search problems, evidence, offers, clients..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          {query && (
            <button onClick={() => { setQuery(""); setResults(null); }}>
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <kbd className="hidden rounded border border-gray-300 px-1.5 py-0.5 text-[10px] text-gray-400 sm:inline dark:border-gray-600">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {loading && (
            <p className="px-3 py-6 text-center text-sm text-gray-400">Searching...</p>
          )}

          {!loading && results && results.results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {!loading &&
            Object.entries(grouped).map(([idx, items]) => {
              const meta = INDEX_META[idx] || {
                label: idx,
                icon: FileText,
                href: "#",
              };
              const Icon = meta.icon;
              return (
                <div key={idx} className="mb-2">
                  <p className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </p>
                  {items.map((r) => {
                    const snippet = highlightSnippet(r);
                    return (
                      <a
                        key={r.id}
                        href={`${meta.href}/${r.id}`}
                        className={clsx(
                          "flex flex-col rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                        onClick={onClose}
                      >
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {displayName(r)}
                        </span>
                        {snippet && (
                          <span
                            className="mt-0.5 line-clamp-1 text-xs text-gray-500"
                            dangerouslySetInnerHTML={{ __html: snippet }}
                          />
                        )}
                      </a>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
