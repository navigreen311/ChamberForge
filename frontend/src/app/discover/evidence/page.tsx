"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface EvidenceRecord {
  id: number | string;
  problem?: string;
  problem_title?: string;
  type: string;
  source_type?: string;
  source: string;
  credibility: number;
  credibility_score?: number;
  summary: string;
  date: string;
  publication_date?: string;
  status: string;
}

type SortKey = "date" | "credibility" | "source" | "type" | "status";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function EvidenceBrowserPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("credibility");
  const [sortAsc, setSortAsc] = useState(false);
  const [analystQueueCount, setAnalystQueueCount] = useState<number | null>(null);

  const fetchEvidence = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {
        sort_by: sortKey,
        sort_order: sortAsc ? "asc" : "desc",
      };
      const res = await api.get("/api/v1/evidence", { params });
      const data = res.data;
      setEvidence(Array.isArray(data) ? data : data.items ?? data.results ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Failed to fetch evidence");
    } finally {
      setLoading(false);
    }
  }, [sortKey, sortAsc]);

  const fetchAnalystQueue = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/evidence/analyst-queue");
      const data = res.data;
      setAnalystQueueCount(Array.isArray(data) ? data.length : data.total ?? data.count ?? 0);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
    fetchAnalystQueue();
  }, [fetchEvidence, fetchAnalystQueue]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  // Client-side sort fallback in case the API doesn't handle sorting
  const sorted = [...evidence].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "credibility") return ((a.credibility ?? a.credibility_score ?? 0) - (b.credibility ?? b.credibility_score ?? 0)) * dir;
    if (sortKey === "date") return (new Date(a.date ?? a.publication_date ?? 0).getTime() - new Date(b.date ?? b.publication_date ?? 0).getTime()) * dir;
    const aVal = (a as any)[sortKey] ?? "";
    const bVal = (b as any)[sortKey] ?? "";
    return aVal.localeCompare(bVal) * dir;
  });

  if (loading && evidence.length === 0) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/discover" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Discovery</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Evidence Browser</h1>
      <p className="text-chamber-400 mb-8">All collected evidence across problem domains, sorted by credibility</p>

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              {(["type", "source", "credibility", "status", "date"] as SortKey[]).map((key) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider cursor-pointer hover:text-gold-400 transition"
                >
                  {key} {sortKey === key ? (sortAsc ? "\u2191" : "\u2193") : ""}
                </th>
              ))}
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Summary</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Problem</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const cred = e.credibility ?? e.credibility_score ?? 0;
              const eType = e.type ?? e.source_type ?? "Unknown";
              const eDate = e.date ?? e.publication_date ?? "—";
              return (
                <tr key={e.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      eType === "Data" ? "bg-blue-400/20 text-blue-400" :
                      eType === "Survey" ? "bg-purple-400/20 text-purple-400" :
                      eType === "Interview" ? "bg-green-400/20 text-green-400" :
                      eType === "Report" ? "bg-gold-400/20 text-gold-400" :
                      "bg-chamber-700 text-chamber-300"
                    }`}>{eType}</span>
                  </td>
                  <td className="px-5 py-4 text-white text-sm">{e.source}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-chamber-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cred >= 85 ? "bg-green-400" : cred >= 70 ? "bg-gold-400" : "bg-orange-400"}`} style={{ width: `${cred}%` }} />
                      </div>
                      <span className="text-sm text-chamber-300">{cred}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      e.status === "Verified" ? "bg-green-400/20 text-green-400" :
                      e.status === "Pending" ? "bg-gold-400/20 text-gold-400" :
                      "bg-chamber-700 text-chamber-400"
                    }`}>{e.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-chamber-400">{eDate}</td>
                  <td className="px-5 py-4 text-sm text-chamber-300 max-w-xs truncate">{e.summary}</td>
                  <td className="px-5 py-4 text-sm text-chamber-500">{e.problem ?? e.problem_title ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-chamber-500">{evidence.length} evidence records</p>
        <a href="/discover/evidence/analyst-queue" className="text-gold-400 text-sm hover:underline">
          Open Analyst Queue{analystQueueCount !== null ? ` (${analystQueueCount})` : ""} &rarr;
        </a>
      </div>
    </div>
  );
}
