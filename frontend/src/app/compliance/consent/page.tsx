"use client";

import { useState } from "react";
import ConsentTracker from "@/components/modules/ConsentTracker";

interface ConsentRecord {
  id: string;
  client_id: string;
  client_name: string;
  consent_type: string;
  status: "active" | "revoked";
  granted_at: string;
  revoked_at: string | null;
}

const CONSENT_TYPES = ["data_processing", "nda", "marketing", "third_party_sharing"] as const;

const MOCK_CONSENTS: ConsentRecord[] = [
  { id: "c1", client_id: "cl1", client_name: "Thornton Family Office", consent_type: "data_processing", status: "active", granted_at: "2025-11-15T10:00:00Z", revoked_at: null },
  { id: "c2", client_id: "cl1", client_name: "Thornton Family Office", consent_type: "nda", status: "active", granted_at: "2025-11-15T10:00:00Z", revoked_at: null },
  { id: "c3", client_id: "cl1", client_name: "Thornton Family Office", consent_type: "marketing", status: "revoked", granted_at: "2025-11-15T10:00:00Z", revoked_at: "2026-02-01T14:30:00Z" },
  { id: "c4", client_id: "cl2", client_name: "Whitfield Trust", consent_type: "data_processing", status: "active", granted_at: "2026-01-10T09:00:00Z", revoked_at: null },
  { id: "c5", client_id: "cl2", client_name: "Whitfield Trust", consent_type: "nda", status: "active", granted_at: "2026-01-10T09:00:00Z", revoked_at: null },
  { id: "c6", client_id: "cl2", client_name: "Whitfield Trust", consent_type: "marketing", status: "active", granted_at: "2026-01-10T09:00:00Z", revoked_at: null },
  { id: "c7", client_id: "cl2", client_name: "Whitfield Trust", consent_type: "third_party_sharing", status: "active", granted_at: "2026-01-10T09:00:00Z", revoked_at: null },
  { id: "c8", client_id: "cl3", client_name: "Chen Investment Group", consent_type: "data_processing", status: "revoked", granted_at: "2025-06-20T08:00:00Z", revoked_at: "2026-03-15T16:00:00Z" },
  { id: "c9", client_id: "cl3", client_name: "Chen Investment Group", consent_type: "nda", status: "revoked", granted_at: "2025-06-20T08:00:00Z", revoked_at: "2026-03-15T16:00:00Z" },
];

export default function ConsentLedgerPage() {
  const [consents, setConsents] = useState<ConsentRecord[]>(MOCK_CONSENTS);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "revoked">("all");
  const [showGrantModal, setShowGrantModal] = useState(false);

  const filtered = consents.filter(
    (c) => filterStatus === "all" || c.status === filterStatus
  );

  // Group by client
  const clientGroups = filtered.reduce<Record<string, ConsentRecord[]>>((acc, c) => {
    const key = c.client_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const handleRevoke = (consentId: string) => {
    setConsents((prev) =>
      prev.map((c) =>
        c.id === consentId
          ? { ...c, status: "revoked" as const, revoked_at: new Date().toISOString() }
          : c
      )
    );
  };

  const handleGrant = (clientId: string, consentType: string) => {
    const newConsent: ConsentRecord = {
      id: `c${Date.now()}`,
      client_id: clientId,
      client_name: consents.find((c) => c.client_id === clientId)?.client_name || "Unknown",
      consent_type: consentType,
      status: "active",
      granted_at: new Date().toISOString(),
      revoked_at: null,
    };
    setConsents((prev) => [...prev, newConsent]);
  };

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gold-400">
              Consent Ledger
            </h1>
            <p className="text-chamber-400 mt-1">
              Track and manage client consent records across all consent types
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="bg-chamber-800 border border-chamber-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>

        {/* Client-grouped consent table */}
        <div className="space-y-6">
          {Object.entries(clientGroups).map(([clientName, records]) => (
            <div
              key={clientName}
              className="bg-chamber-900 border border-chamber-800 rounded-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-chamber-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{clientName}</h3>
                  <ConsentTracker
                    consents={records.map((r) => ({
                      type: r.consent_type,
                      status: r.status,
                    }))}
                  />
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-chamber-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Consent Type</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Granted</th>
                    <th className="px-6 py-3">Revoked</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chamber-800">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-chamber-800/30">
                      <td className="px-6 py-3">
                        <span className="text-sm text-white font-mono">
                          {record.consent_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            record.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-chamber-400 font-mono">
                        {new Date(record.granted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-chamber-400 font-mono">
                        {record.revoked_at
                          ? new Date(record.revoked_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {record.status === "active" ? (
                          <button
                            onClick={() => handleRevoke(record.id)}
                            className="text-xs px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGrant(record.client_id, record.consent_type)}
                            className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 transition-colors"
                          >
                            Re-grant
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
