"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ContactStatus = {
  contact: string;
  status: "ringing" | "acknowledged" | "failed";
};

type EscalationResult = {
  escalation_id: string;
  calls_initiated: number;
  statuses: ContactStatus[];
};

type EscalationStatusResponse = {
  escalation_id: string;
  acknowledged_by: string[];
  pending: string[];
  failed: string[];
};

type ContactInput = {
  name: string;
  phone: string;
};

const STATUS_CONFIG = {
  ringing: { icon: "📞", color: "text-amber-400", bg: "bg-amber-900/30", label: "Ringing" },
  acknowledged: { icon: "✓", color: "text-green-400", bg: "bg-green-900/30", label: "Acknowledged" },
  failed: { icon: "✕", color: "text-red-400", bg: "bg-red-900/30", label: "Failed" },
  pending: { icon: "⏳", color: "text-gray-400", bg: "bg-gray-800", label: "Pending" },
} as const;

export default function VoiceEscalation() {
  const [contacts, setContacts] = useState<ContactInput[]>([
    { name: "", phone: "" },
  ]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalationId, setEscalationId] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<
    { name: string; status: keyof typeof STATUS_CONFIG }[]
  >([]);

  function addContact() {
    setContacts((prev) => [...prev, { name: "", phone: "" }]);
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateContact(index: number, field: "name" | "phone", value: string) {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  async function initiateEscalation() {
    const validContacts = contacts.filter((c) => c.name && c.phone);
    if (validContacts.length === 0 || !summary.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/voiceforge/crisis/escalate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: validContacts, incident_summary: summary }),
      });
      const data: EscalationResult = await res.json();
      setEscalationId(data.escalation_id);
      setStatuses(
        data.statuses.map((s) => ({
          name: s.contact,
          status: s.status as keyof typeof STATUS_CONFIG,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshStatus() {
    if (!escalationId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/v1/voiceforge/crisis/${escalationId}/status`
      );
      const data: EscalationStatusResponse = await res.json();
      const merged: { name: string; status: keyof typeof STATUS_CONFIG }[] = [];
      for (const name of data.acknowledged_by) {
        merged.push({ name, status: "acknowledged" });
      }
      for (const name of data.pending) {
        merged.push({ name, status: "pending" });
      }
      for (const name of data.failed) {
        merged.push({ name, status: "failed" });
      }
      setStatuses(merged);
    } finally {
      setLoading(false);
    }
  }

  // ---- Setup form ----
  if (!escalationId) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold">Crisis Escalation</h2>

        <label className="block">
          <span className="text-sm font-medium text-gray-300">Incident Summary</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe the crisis incident..."
            rows={3}
            className="mt-1 block w-full rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white placeholder-gray-500"
          />
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Contacts</span>
            <button
              onClick={addContact}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              + Add Contact
            </button>
          </div>
          {contacts.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={c.name}
                onChange={(e) => updateContact(i, "name", e.target.value)}
                placeholder="Name"
                className="flex-1 rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white placeholder-gray-500 text-sm"
              />
              <input
                value={c.phone}
                onChange={(e) => updateContact(i, "phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="flex-1 rounded bg-chamber-800 border border-chamber-700 px-3 py-2 text-white placeholder-gray-500 text-sm"
              />
              {contacts.length > 1 && (
                <button
                  onClick={() => removeContact(i)}
                  className="text-red-400 hover:text-red-300 text-sm px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={initiateEscalation}
          disabled={loading || !summary.trim() || !contacts.some((c) => c.name && c.phone)}
          className="w-full rounded bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Initiating..." : "Initiate Crisis Escalation"}
        </button>
      </div>
    );
  }

  // ---- Status display ----
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Escalation Status</h2>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="text-sm rounded bg-chamber-700 px-3 py-1.5 text-gray-300 hover:bg-chamber-600 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh Status"}
        </button>
      </div>

      <div className="text-sm text-gray-400">
        Escalation ID: <span className="font-mono text-gray-300">{escalationId}</span>
      </div>

      <div className="space-y-2">
        {statuses.map((s, i) => {
          const cfg = STATUS_CONFIG[s.status];
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 ${cfg.bg}`}
            >
              <span className="text-xl w-8 text-center">{cfg.icon}</span>
              <span className="flex-1 font-medium">{s.name}</span>
              <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          setEscalationId(null);
          setStatuses([]);
          setContacts([{ name: "", phone: "" }]);
          setSummary("");
        }}
        className="w-full rounded bg-chamber-700 px-4 py-2 text-gray-300 hover:bg-chamber-600"
      >
        New Escalation
      </button>
    </div>
  );
}
