"use client";

import { useState } from "react";
import api from "@/lib/api";

interface PortalClient {
  id: string;
  name: string;
  portalId: string | null;
  token: string | null;
  isActive: boolean;
}

export default function PortalAdminPage() {
  const [clients, setClients] = useState<PortalClient[]>([
    { id: "c1", name: "Meridian Family Office", portalId: null, token: null, isActive: false },
    { id: "c2", name: "Thornton Capital Group", portalId: null, token: null, isActive: false },
    { id: "c3", name: "Evergreen Wealth Partners", portalId: null, token: null, isActive: false },
    { id: "c4", name: "Pinnacle Ventures LLC", portalId: null, token: null, isActive: false },
  ]);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function generateAccess(clientId: string) {
    setLoading(clientId);
    try {
      const res = await api.post(`/api/v1/portal/access`, { client_id: clientId });
      const data = res.data;
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId
            ? { ...c, portalId: data.id, token: data.portal_token, isActive: true }
            : c,
        ),
      );
    } catch (err) {
      console.error("Failed to generate portal access:", err);
    } finally {
      setLoading(null);
    }
  }

  async function revokeAccess(clientId: string, portalId: string) {
    setLoading(clientId);
    try {
      await api.delete(`/api/v1/portal/access/${portalId}`);
      setClients((prev) =>
        prev.map((c) =>
          c.id === clientId ? { ...c, portalId: null, token: null, isActive: false } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to revoke portal access:", err);
    } finally {
      setLoading(null);
    }
  }

  function copyLink(token: string, clientId: string) {
    const link = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(clientId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-2">Client Delivery Portal</h1>
      <p className="text-chamber-300 mb-8">
        Manage portal access for your clients. Generate secure links so clients can view deliverables,
        KPIs, and reports.
      </p>

      <div className="rounded-lg border border-chamber-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-chamber-900 text-chamber-400 text-sm">
              <th className="text-left px-6 py-3 font-medium">Client</th>
              <th className="text-left px-6 py-3 font-medium">Portal Status</th>
              <th className="text-left px-6 py-3 font-medium">Portal Link</th>
              <th className="text-right px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-chamber-800">
            {clients.map((client) => (
              <tr key={client.id} className="bg-chamber-950 hover:bg-chamber-900 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-white">{client.name}</span>
                </td>
                <td className="px-6 py-4">
                  {client.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-400">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-chamber-800 px-2.5 py-0.5 text-xs font-medium text-chamber-400">
                      No Access
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {client.token ? (
                    <button
                      onClick={() => copyLink(client.token!, client.id)}
                      className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      {copied === client.id ? "Copied!" : "Copy Link"}
                    </button>
                  ) : (
                    <span className="text-sm text-chamber-500">&mdash;</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {client.isActive && client.portalId ? (
                    <button
                      onClick={() => revokeAccess(client.id, client.portalId!)}
                      disabled={loading === client.id}
                      className="text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-colors"
                    >
                      {loading === client.id ? "Revoking..." : "Revoke"}
                    </button>
                  ) : (
                    <button
                      onClick={() => generateAccess(client.id)}
                      disabled={loading === client.id}
                      className="text-sm bg-gold-500 hover:bg-gold-600 text-chamber-950 px-3 py-1.5 rounded font-semibold disabled:opacity-50 transition-colors"
                    >
                      {loading === client.id ? "Generating..." : "Generate Access"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-chamber-900 rounded-lg border border-chamber-700">
        <h3 className="text-sm font-medium text-chamber-300 mb-2">How it works</h3>
        <ul className="text-sm text-chamber-400 space-y-1">
          <li>1. Click &quot;Generate Access&quot; to create a secure portal link for a client.</li>
          <li>2. Copy the link and share it with your client via email or secure messaging.</li>
          <li>3. Clients can view deliverables, KPIs, and reports without needing to log in.</li>
          <li>4. Revoke access at any time to disable the portal link.</li>
        </ul>
      </div>
    </main>
  );
}
