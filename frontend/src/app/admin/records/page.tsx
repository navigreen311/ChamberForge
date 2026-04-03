"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

const DOCUMENT_CLASSES = [
  "evidence",
  "offer",
  "client",
  "audit_log",
  "notification",
  "email_log",
] as const;

interface RetentionPolicy {
  id: string;
  workspace_id: string;
  document_class: string;
  retention_days: number;
  auto_delete: boolean;
}

interface ExpiredEntry {
  document_class: string;
  retention_days: number;
  auto_delete: boolean;
  total_expired: number;
  eligible_for_deletion: number;
  under_legal_hold: number;
}

interface LegalHoldEntry {
  id: string;
  resource_type: string;
  resource_id: string;
  reason: string;
  created_at: string | null;
}

interface RetentionReport {
  workspace_id: string;
  policies: RetentionPolicy[];
  approaching_expiry: { document_class: string; count: number; expires_within_days: number }[];
  active_holds: LegalHoldEntry[];
  generated_at: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RecordsRetentionPage() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [expired, setExpired] = useState<ExpiredEntry[]>([]);
  const [report, setReport] = useState<RetentionReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [running, setRunning] = useState(false);

  // Form state
  const [formClass, setFormClass] = useState(DOCUMENT_CLASSES[0]);
  const [formDays, setFormDays] = useState(365);
  const [formAutoDelete, setFormAutoDelete] = useState(false);

  // TODO: replace with real workspace_id from auth context
  const workspaceId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  const fetchData = useCallback(async () => {
    try {
      const [policiesRes, expiredRes, reportRes] = await Promise.allSettled([
        api.get(`/api/v1/admin/records/policies?workspace_id=${workspaceId}`),
        api.get(`/api/v1/admin/records/expired?workspace_id=${workspaceId}`),
        api.get(`/api/v1/admin/records/report?workspace_id=${workspaceId}`),
      ]);

      if (policiesRes.status === "fulfilled") setPolicies(policiesRes.value.data);
      if (expiredRes.status === "fulfilled") setExpired(expiredRes.value.data);
      if (reportRes.status === "fulfilled") setReport(reportRes.value.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load records data");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPolicy = async () => {
    try {
      await api.post("/api/v1/admin/records/policies", {
        workspace_id: workspaceId,
        document_class: formClass,
        retention_days: formDays,
        auto_delete: formAutoDelete,
      });
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create policy");
    }
  };

  const handleRunCleanup = async () => {
    setRunning(true);
    setCleanupResult(null);
    try {
      const res = await api.post(`/api/v1/admin/records/cleanup?workspace_id=${workspaceId}`);
      setCleanupResult(res.data);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Cleanup failed");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Records Retention</h1>
      <p className="text-chamber-400 mb-8">
        Manage retention policies, preview expired records, and enforce cleanup with legal hold protection.
      </p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 mb-6">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline text-sm">
            dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Retention Policies */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Retention Policies</h3>
          {policies.length === 0 ? (
            <p className="text-chamber-500 text-sm">No policies configured yet.</p>
          ) : (
            <div className="space-y-2">
              {policies.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg"
                >
                  <div>
                    <span className="text-white text-sm font-medium capitalize">
                      {p.document_class.replace("_", " ")}
                    </span>
                    <span className="text-chamber-400 text-xs ml-2">
                      {p.retention_days} days
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.auto_delete
                        ? "bg-red-400/20 text-red-400"
                        : "bg-chamber-700 text-chamber-400"
                    }`}
                  >
                    {p.auto_delete ? "Auto-delete" : "Manual"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add Policy Form */}
          <div className="mt-4 pt-4 border-t border-chamber-800">
            <h4 className="text-sm font-medium text-chamber-300 mb-3">Add / Update Policy</h4>
            <div className="space-y-3">
              <select
                value={formClass}
                onChange={(e) => setFormClass(e.target.value)}
                className="w-full bg-chamber-800 text-white rounded-lg px-3 py-2 text-sm border border-chamber-700"
              >
                {DOCUMENT_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={formDays}
                onChange={(e) => setFormDays(Number(e.target.value))}
                placeholder="Retention days"
                className="w-full bg-chamber-800 text-white rounded-lg px-3 py-2 text-sm border border-chamber-700"
              />
              <label className="flex items-center gap-2 text-sm text-chamber-300">
                <input
                  type="checkbox"
                  checked={formAutoDelete}
                  onChange={(e) => setFormAutoDelete(e.target.checked)}
                  className="rounded"
                />
                Enable auto-delete
              </label>
              <button
                onClick={handleAddPolicy}
                className="w-full bg-gold-500 hover:bg-gold-400 text-black font-medium rounded-lg px-4 py-2 text-sm transition"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>

        {/* Expired Records Preview */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Expired Records Preview</h3>
          {expired.length === 0 ? (
            <p className="text-chamber-500 text-sm">No expired records found.</p>
          ) : (
            <div className="space-y-2">
              {expired.map((e) => (
                <div
                  key={e.document_class}
                  className="p-3 bg-chamber-800/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium capitalize">
                      {e.document_class.replace("_", " ")}
                    </span>
                    <span className="text-chamber-400 text-xs">
                      {e.retention_days}d retention
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-red-400">
                      {e.eligible_for_deletion} eligible for deletion
                    </span>
                    <span className="text-gold-400">
                      {e.under_legal_hold} under legal hold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleRunCleanup}
            disabled={running}
            className="mt-4 w-full bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition"
          >
            {running ? "Running Cleanup..." : "Run Cleanup"}
          </button>

          {cleanupResult && (
            <div className="mt-3 p-3 bg-green-400/10 border border-green-400/30 rounded-lg text-sm">
              <p className="text-green-400 font-medium">Cleanup Complete</p>
              <p className="text-chamber-300 text-xs mt-1">
                Deleted: {cleanupResult.deleted_count} | Held: {cleanupResult.skipped_legal_hold}
              </p>
              {cleanupResult.by_class && Object.keys(cleanupResult.by_class).length > 0 && (
                <p className="text-chamber-400 text-xs mt-1">
                  {Object.entries(cleanupResult.by_class)
                    .map(([cls, cnt]) => `${cls}: ${cnt}`)
                    .join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legal Holds & Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legal Holds */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Active Legal Holds</h3>
          {report && report.active_holds.length > 0 ? (
            <div className="space-y-2">
              {report.active_holds.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-chamber-800/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium capitalize">
                      {h.resource_type}
                    </span>
                    <span className="text-chamber-500 text-xs font-mono">
                      {h.resource_id.slice(0, 8)}...
                    </span>
                  </div>
                  <p className="text-chamber-400 text-xs">{h.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-chamber-500 text-sm">No active legal holds.</p>
          )}
        </div>

        {/* Retention Report Summary */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Retention Report</h3>
          {report ? (
            <div className="space-y-4">
              <div>
                <p className="text-chamber-400 text-xs mb-2">Policies configured</p>
                <p className="text-white text-2xl font-bold">{report.policies.length}</p>
              </div>
              {report.approaching_expiry.length > 0 && (
                <div>
                  <p className="text-gold-400 text-xs mb-2">Approaching expiry (next 30 days)</p>
                  <div className="space-y-1">
                    {report.approaching_expiry.map((a) => (
                      <div
                        key={a.document_class}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-chamber-300 capitalize">
                          {a.document_class.replace("_", " ")}
                        </span>
                        <span className="text-gold-400 font-medium">{a.count} records</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-chamber-400 text-xs mb-2">Active holds</p>
                <p className="text-white text-2xl font-bold">{report.active_holds.length}</p>
              </div>
              <p className="text-chamber-600 text-xs">
                Generated: {new Date(report.generated_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-chamber-500 text-sm">Report unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
