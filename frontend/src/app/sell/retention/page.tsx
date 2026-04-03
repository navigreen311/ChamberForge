"use client";

import { useState } from "react";

interface ClientHealth {
  client_id: string;
  client_name: string;
  health_score: number;
  risk_level: string;
  renewal_date: string;
  monthly_value: number;
}

interface ClientDetail {
  client_id: string;
  client_name: string;
  health_score: number;
  risk_level: string;
  metrics: {
    engagement: number;
    satisfaction: number;
    usage: number;
    payment_history: number;
  };
  upsell_triggers: Array<{
    type: string;
    message: string;
    confidence: string;
  }>;
}

export default function RetentionPage() {
  const [clients, setClients] = useState<ClientHealth[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newMonths, setNewMonths] = useState("12");
  const [newValue, setNewValue] = useState("10000");
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/v1/sell/retention/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  const addClient = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/sell/retention/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: newId,
          client_name: newName,
          contract_start: newStart,
          contract_months: parseInt(newMonths),
          monthly_value: parseFloat(newValue),
        }),
      });
      setShowAddForm(false);
      setNewId("");
      setNewName("");
      setNewStart("");
      await fetchClients();
    } catch (err) {
      console.error("Failed to add client:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewHealth = async (clientId: string) => {
    try {
      const res = await fetch(`/api/v1/sell/retention/client/${clientId}/health`);
      const data = await res.json();
      setSelectedClient(data);
    } catch (err) {
      console.error("Failed to fetch health:", err);
    }
  };

  const riskColors: Record<string, string> = {
    low: "bg-emerald-500/20 text-emerald-400",
    medium: "bg-amber-500/20 text-amber-400",
    high: "bg-red-500/20 text-red-400",
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 5) return "text-amber-400";
    return "text-red-400";
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Retention</h1>
            <p className="mt-2 text-zinc-400">
              Health scores, risk levels, and upsell triggers
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchClients}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Add Client
            </button>
          </div>
        </div>

        {/* Add Client Form */}
        {showAddForm && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="text-lg font-semibold text-white">
              Register Client for Retention Tracking
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
              <div>
                <label className="block text-sm text-zinc-300">Client ID</label>
                <input
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="client-001"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-300">Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-300">
                  Contract Start
                </label>
                <input
                  type="date"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-300">Months</label>
                <input
                  type="number"
                  value={newMonths}
                  onChange={(e) => setNewMonths(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-300">
                  Monthly Value ($)
                </label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={addClient}
              disabled={loading || !newId || !newName || !newStart}
              className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Register Client"}
            </button>
          </div>
        )}

        {/* Client Health Table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-zinc-400">Client</th>
                <th className="px-4 py-3 text-center text-zinc-400">
                  Health Score
                </th>
                <th className="px-4 py-3 text-center text-zinc-400">Risk</th>
                <th className="px-4 py-3 text-right text-zinc-400">
                  Monthly Value
                </th>
                <th className="px-4 py-3 text-right text-zinc-400">Renewal</th>
                <th className="px-4 py-3 text-right text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-zinc-500"
                  >
                    No clients registered. Add a client or click Refresh.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr
                    key={c.client_id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {c.client_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-lg font-bold ${scoreColor(c.health_score)}`}>
                        {c.health_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          riskColors[c.risk_level] || "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {c.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(c.monthly_value)}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-400">
                      {c.renewal_date.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewHealth(c.client_id)}
                        className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Client Detail Panel */}
        {selectedClient && (
          <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {selectedClient.client_name}
              </h3>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  riskColors[selectedClient.risk_level] || ""
                }`}
              >
                {selectedClient.risk_level} risk
              </span>
            </div>

            {/* Metric Bars */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {Object.entries(selectedClient.metrics).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-zinc-400">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className={scoreColor(val)}>{val}/10</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-zinc-800">
                    <div
                      className={`h-2 rounded-full ${
                        val >= 8
                          ? "bg-emerald-500"
                          : val >= 5
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${val * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Upsell Triggers */}
            {selectedClient.upsell_triggers.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-zinc-400">
                  Upsell Triggers
                </h4>
                <div className="mt-2 space-y-2">
                  {selectedClient.upsell_triggers.map((trigger, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-violet-500/10 px-4 py-2 text-sm text-violet-300"
                    >
                      <span className="font-medium">{trigger.type}:</span>{" "}
                      {trigger.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
