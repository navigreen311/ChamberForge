"use client";

import { useState, useEffect } from "react";

const initialRecords = [
  { id: 1, client: "Henderson Family Office", type: "Data Processing", jurisdiction: "GDPR", granted: "2025-06-15", expires: "2026-06-15", status: "active" as const },
  { id: 2, client: "Henderson Family Office", type: "Marketing Communications", jurisdiction: "GDPR", granted: "2025-06-15", expires: "2026-06-15", status: "active" as const },
  { id: 3, client: "Blackwell Holdings", type: "Data Processing", jurisdiction: "CCPA", granted: "2025-09-01", expires: "2026-09-01", status: "active" as const },
  { id: 4, client: "Sterling Capital Group", type: "Data Sharing", jurisdiction: "GDPR", granted: "2025-04-10", expires: "2026-04-10", status: "expiring" as const },
  { id: 5, client: "Meridian Ventures", type: "Data Processing", jurisdiction: "CCPA", granted: "2025-08-20", expires: "2026-08-20", status: "active" as const },
  { id: 6, client: "Pacific Trust", type: "Marketing Communications", jurisdiction: "GDPR", granted: "2025-03-01", expires: "2026-03-01", status: "expired" as const },
  { id: 7, client: "Apex Family Office", type: "Data Processing", jurisdiction: "GDPR", granted: null, expires: null, status: "pending" as const },
  { id: 8, client: "Crown Estate Partners", type: "Data Sharing", jurisdiction: "CCPA", granted: "2025-11-10", expires: "2026-11-10", status: "active" as const },
];

type ConsentStatus = "active" | "expired" | "expiring" | "pending" | "revoked";

interface ConsentRecord {
  id: number;
  client: string;
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
  const [records, setRecords] = useState<ConsentRecord[]>(initialRecords);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const updateStatus = (id: number, status: ConsentStatus) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status, granted: status === "active" ? "2026-04-03" : r.granted, expires: status === "active" ? "2027-04-03" : r.expires } : r));
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
            {records.map((r) => (
              <tr key={r.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium text-sm">{r.client}</td>
                <td className="px-5 py-4 text-chamber-300 text-sm">{r.type}</td>
                <td className="px-5 py-4"><span className="px-2 py-0.5 bg-chamber-800 text-chamber-300 text-xs rounded">{r.jurisdiction}</span></td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{r.granted || "—"}</td>
                <td className="px-5 py-4 text-chamber-400 text-sm">{r.expires || "—"}</td>
                <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>{r.status}</span></td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {(r.status === "expired" || r.status === "pending" || r.status === "expiring") && (
                      <button onClick={() => updateStatus(r.id, "active")} className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-lg hover:bg-green-400/30 transition">Grant</button>
                    )}
                    {r.status === "active" && (
                      <button onClick={() => updateStatus(r.id, "revoked")} className="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded-lg hover:bg-red-400/30 transition">Revoke</button>
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
