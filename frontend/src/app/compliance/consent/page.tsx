"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

type ConsentStatus = "active" | "expired" | "expiring" | "pending" | "revoked";

interface ConsentRecord {
  id: string;
  client: string;
  client_id: string;
  type: string;
  jurisdiction: string;
  granted: string | null;
  expires: string | null;
  status: ConsentStatus;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function ConsentLedgerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConsents() {
      try {
        const res = await api.get("/api/v1/compliance/consent");
        setRecords(res.data);
      } catch (err: any) {
        setError(err?.message || "Failed to load consent records");
      } finally {
        setLoading(false);
      }
    }
    fetchConsents();
  }, []);

  const grantConsent = async (record: ConsentRecord) => {
    setActionLoading(record.id);
    try {
      const res = await api.post("/api/v1/compliance/consent", {
        client_id: record.client_id,
        type: record.type,
        jurisdiction: record.jurisdiction,
      });
      setRecords((prev) =>
        prev.map((r) => (r.id === record.id ? { ...r, ...res.data, status: "active" as ConsentStatus } : r))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to grant consent");
    } finally {
      setActionLoading(null);
    }
  };

  const revokeConsent = async (id: string) => {
    setActionLoading(id);
    try {
      await api.post(`/api/v1/compliance/consent/${id}/revoke`);
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "revoked" as ConsentStatus } : r))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to revoke consent");
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (s: ConsentStatus) => {
    const map: Record<ConsentStatus, string> = {
      active: "bg-green-400/20 text-green-400",
      expired: "bg-red-400/20 text-red-400",
      expiring: "bg-gold-400/20 text-gold-400",
      pending: "bg-blue-400/20 text-blue-400",
      revoked: "bg-chamber-700 text-chamber-400",
    };
    return map[s];
  };

  if (loading) {
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
      <a href="/compliance" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Compliance</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Consent Ledger</h1>
      <p className="text-chamber-400 mb-8">Track, grant, and revoke client data consent records</p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 mb-6">{error}</div>
      )}

      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Jurisdiction</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Granted</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Expires</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-chamber-500">No consent records found.</td></tr>
            ) : records.map((r) => (
              <tr key={r.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium text-sm">{r.client}</td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{r.type}</td>
                <td className="px-5 py-4"><span className="px-2 py-0.5 bg-chamber-800 text-chamber-300 text-xs rounded">{r.jurisdiction}</span></td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{r.granted || "\u2014"}</td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{r.expires || "\u2014"}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>{r.status}</span></td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {(r.status === "expired" || r.status === "pending" || r.status === "expiring") && (
                      <button
                        onClick={() => grantConsent(r)}
                        disabled={actionLoading === r.id}
                        className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-lg hover:bg-green-400/30 transition disabled:opacity-50"
                      >
                        {actionLoading === r.id ? "..." : "Grant"}
                      </button>
                    )}
                    {r.status === "active" && (
                      <button
                        onClick={() => revokeConsent(r.id)}
                        disabled={actionLoading === r.id}
                        className="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded-lg hover:bg-red-400/30 transition disabled:opacity-50"
                      >
                        {actionLoading === r.id ? "..." : "Revoke"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
