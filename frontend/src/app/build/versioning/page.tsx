"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Version {
  id: string;
  version_number: number;
  is_active: boolean;
  changes_summary: string;
  created_by: string | null;
  created_at: string;
}

interface DiffResult {
  added: string[];
  removed: string[];
  changed: string[];
}

export default function VersioningPage() {
  const [templateId, setTemplateId] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [diffV1, setDiffV1] = useState("");
  const [diffV2, setDiffV2] = useState("");

  async function fetchHistory() {
    if (!templateId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/polish/versions/${templateId}`);
      const data = await res.json();
      setVersions(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }

  async function rollback(version: number) {
    if (!confirm(`Rollback to version ${version}?`)) return;
    try {
      await fetch(
        `${API}/api/v1/polish/versions/${templateId}/rollback/${version}`,
        { method: "POST" }
      );
      fetchHistory();
    } catch (err) {
      console.error("Rollback failed:", err);
    }
  }

  async function compareDiff() {
    try {
      const res = await fetch(`${API}/api/v1/polish/versions/diff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          v1_content: JSON.parse(diffV1),
          v2_content: JSON.parse(diffV2),
        }),
      });
      setDiff(await res.json());
    } catch (err) {
      console.error("Diff failed:", err);
    }
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Template Version History
      </h1>

      {/* Search */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Template ID (UUID)"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="flex-1 px-4 py-2 bg-chamber-900 border border-chamber-700 rounded-lg text-white placeholder-chamber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load History"}
        </button>
      </div>

      {/* Version Table */}
      {versions.length > 0 && (
        <div className="bg-chamber-900 rounded-xl border border-chamber-700 overflow-hidden mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-chamber-700 text-chamber-400 text-sm">
                <th className="px-6 py-3 text-left">Version</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Changes</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-chamber-800 hover:bg-chamber-800/50"
                >
                  <td className="px-6 py-4 text-white font-mono">
                    v{v.version_number}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        v.is_active
                          ? "bg-green-900/50 text-green-400"
                          : "bg-chamber-800 text-chamber-500"
                      }`}
                    >
                      {v.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-chamber-300 text-sm">
                    {v.changes_summary}
                  </td>
                  <td className="px-6 py-4 text-chamber-400 text-sm">
                    {v.created_at
                      ? new Date(v.created_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {!v.is_active && (
                      <button
                        onClick={() => rollback(v.version_number)}
                        className="px-3 py-1 text-xs bg-red-900/50 text-red-400 hover:bg-red-800/50 rounded transition-colors"
                      >
                        Rollback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Diff Viewer */}
      <h2 className="text-xl font-bold text-white mb-4">Diff Viewer</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <textarea
          placeholder='Version 1 JSON (e.g., {"title": "Old"})'
          value={diffV1}
          onChange={(e) => setDiffV1(e.target.value)}
          rows={5}
          className="px-4 py-3 bg-chamber-900 border border-chamber-700 rounded-lg text-white placeholder-chamber-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <textarea
          placeholder='Version 2 JSON (e.g., {"title": "New"})'
          value={diffV2}
          onChange={(e) => setDiffV2(e.target.value)}
          rows={5}
          className="px-4 py-3 bg-chamber-900 border border-chamber-700 rounded-lg text-white placeholder-chamber-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <button
        onClick={compareDiff}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors mb-4"
      >
        Compare
      </button>

      {diff && (
        <div className="bg-chamber-900 rounded-xl border border-chamber-700 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-green-400 font-semibold mb-2">
                + Added ({diff.added.length})
              </h3>
              {diff.added.map((k) => (
                <div key={k} className="text-green-300 text-sm font-mono">
                  {k}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-red-400 font-semibold mb-2">
                - Removed ({diff.removed.length})
              </h3>
              {diff.removed.map((k) => (
                <div key={k} className="text-red-300 text-sm font-mono">
                  {k}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-amber-400 font-semibold mb-2">
                ~ Changed ({diff.changed.length})
              </h3>
              {diff.changed.map((k) => (
                <div key={k} className="text-amber-300 text-sm font-mono">
                  {k}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
