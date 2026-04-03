"use client";

import { useEffect, useState, useMemo } from "react";

interface Evidence {
  id: string;
  source_url: string;
  source_type: string;
  publication_date: string;
  credibility_score: number;
  recency_decay_score: number;
  extracted_claims: Array<Record<string, unknown>>;
  contradiction_flags: Array<Record<string, unknown>>;
  problem_id: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

type SortField =
  | "source_url"
  | "source_type"
  | "credibility_score"
  | "recency_decay_score"
  | "claims_count";
type SortDir = "asc" | "desc";

const SOURCE_TYPES = [
  "peer_reviewed",
  "regulatory",
  "industry_report",
  "enforcement_action",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

export default function EvidenceBrowserPage() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("credibility_score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterType, setFilterType] = useState<string>("");
  const [minCredibility, setMinCredibility] = useState<string>("");

  useEffect(() => {
    fetchEvidence();
  }, [filterType, minCredibility]);

  async function fetchEvidence() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        workspace_id: DEFAULT_WORKSPACE,
      });
      if (filterType) params.set("source_type", filterType);
      if (minCredibility) params.set("min_credibility", minCredibility);

      const res = await fetch(`${API_BASE}/api/v1/evidence/?${params}`);
      if (res.ok) {
        setEvidence(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch evidence:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sorted = useMemo(() => {
    return [...evidence].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (sortField === "claims_count") {
        aVal = a.extracted_claims?.length ?? 0;
        bVal = b.extracted_claims?.length ?? 0;
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [evidence, sortField, sortDir]);

  function credibilityColor(score: number) {
    if (score < 4) return "text-red-600 bg-red-50";
    if (score <= 7) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  }

  const SortHeader = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      {label} {sortField === field ? (sortDir === "asc" ? "^" : "v") : ""}
    </th>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Evidence Browser</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border rounded px-3 py-2 text-sm"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {SOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min credibility"
          className="border rounded px-3 py-2 text-sm w-40"
          value={minCredibility}
          onChange={(e) => setMinCredibility(e.target.value)}
          min={0}
          max={10}
          step={0.5}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No evidence found. Ingest sources to get started.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <SortHeader field="source_url" label="Source" />
                <SortHeader field="source_type" label="Type" />
                <SortHeader field="credibility_score" label="Credibility" />
                <SortHeader field="recency_decay_score" label="Recency Score" />
                <SortHeader field="claims_count" label="Claims" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((ev) => (
                <tr
                  key={ev.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/discover/evidence/${ev.id}`)
                  }
                >
                  <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-xs">
                    {ev.source_url}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {ev.source_type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold px-2 py-1 rounded ${credibilityColor(ev.credibility_score)}`}
                    >
                      {ev.credibility_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ev.recency_decay_score.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ev.extracted_claims?.length ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
