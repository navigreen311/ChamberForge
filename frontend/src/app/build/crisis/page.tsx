"use client";

import { useState } from "react";
import EscalationTree from "@/components/modules/EscalationTree";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  timeline: Array<{
    event_type: string;
    description: string;
    timestamp: string;
  }>;
  escalation_tree: Array<{
    level: number;
    contact_name: string;
    contact_method: string;
    role: string;
  }>;
  lockdown_actions: string[];
  resolved_at: string | null;
  created_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-900/50 text-red-400 ring-red-500",
  high: "bg-orange-900/50 text-orange-400 ring-orange-500",
  medium: "bg-amber-900/50 text-amber-400 ring-amber-500",
  low: "bg-blue-900/50 text-blue-400 ring-blue-500",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-red-900/50 text-red-400",
  contained: "bg-amber-900/50 text-amber-400",
  resolved: "bg-green-900/50 text-green-400",
};

export default function CrisisPage() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);

  // Lockdown form
  const [lockdownActions, setLockdownActions] = useState("");
  // Timeline form
  const [eventType, setEventType] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  // Resolve form
  const [resolveNotes, setResolveNotes] = useState("");

  async function fetchIncidents() {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/v1/polish/crisis?workspace_id=${workspaceId}`
      );
      setIncidents(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: string) {
    try {
      const res = await fetch(`${API}/api/v1/polish/crisis/${id}`);
      setSelected(await res.json());
    } catch (err) {
      console.error(err);
    }
  }

  async function addTimelineEvent() {
    if (!selected || !eventType || !eventDesc) return;
    await fetch(`${API}/api/v1/polish/crisis/${selected.id}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        description: eventDesc,
      }),
    });
    setEventType("");
    setEventDesc("");
    loadDetail(selected.id);
  }

  async function executeLockdown() {
    if (!selected || !lockdownActions) return;
    const actions = lockdownActions
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);
    await fetch(`${API}/api/v1/polish/crisis/${selected.id}/lockdown`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actions }),
    });
    setLockdownActions("");
    loadDetail(selected.id);
  }

  async function resolveIncident() {
    if (!selected || !resolveNotes) return;
    await fetch(`${API}/api/v1/polish/crisis/${selected.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution_notes: resolveNotes }),
    });
    setResolveNotes("");
    loadDetail(selected.id);
    fetchIncidents();
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Crisis Mode Console
      </h1>

      {/* Workspace input */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Workspace ID (UUID)"
          value={workspaceId}
          onChange={(e) => setWorkspaceId(e.target.value)}
          className="flex-1 px-4 py-2 bg-chamber-900 border border-chamber-700 rounded-lg text-white placeholder-chamber-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={fetchIncidents}
          disabled={loading}
          className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
        >
          Load Active Incidents
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Incident List */}
        <div className="col-span-1 space-y-3">
          <h2 className="text-lg font-semibold text-chamber-300 mb-2">
            Active Incidents
          </h2>
          {incidents.map((inc) => (
            <button
              key={inc.id}
              onClick={() => loadDetail(inc.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selected?.id === inc.id
                  ? "bg-chamber-800 border-red-500"
                  : "bg-chamber-900 border-chamber-700 hover:border-chamber-500"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-semibold text-sm truncate">
                  {inc.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ring-1 ${
                    SEVERITY_COLORS[inc.severity] || ""
                  }`}
                >
                  {inc.severity.toUpperCase()}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  STATUS_COLORS[inc.status] || ""
                }`}
              >
                {inc.status}
              </span>
            </button>
          ))}
          {incidents.length === 0 && (
            <p className="text-chamber-500 text-sm">No active incidents</p>
          )}
        </div>

        {/* Detail Panel */}
        <div className="col-span-2">
          {selected ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {selected.title}
                  </h2>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ring-1 ${
                        SEVERITY_COLORS[selected.severity] || ""
                      }`}
                    >
                      {selected.severity.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-sm ${
                        STATUS_COLORS[selected.status] || ""
                      }`}
                    >
                      {selected.status}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <h3 className="text-lg font-semibold text-white mb-3">
                  Timeline
                </h3>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {(selected.timeline || []).map((evt, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-sm border-l-2 border-chamber-600 pl-3"
                    >
                      <span className="text-chamber-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-amber-400 font-mono text-xs uppercase">
                        {evt.event_type}
                      </span>
                      <span className="text-chamber-300">{evt.description}</span>
                    </div>
                  ))}
                </div>

                {/* Add Timeline Event */}
                {selected.status !== "resolved" && (
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      placeholder="Event type"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="px-3 py-2 bg-chamber-800 border border-chamber-600 rounded text-white text-sm w-40"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="flex-1 px-3 py-2 bg-chamber-800 border border-chamber-600 rounded text-white text-sm"
                    />
                    <button
                      onClick={addTimelineEvent}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded"
                    >
                      Add Event
                    </button>
                  </div>
                )}
              </div>

              {/* Escalation Tree */}
              <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Escalation Tree
                </h3>
                <EscalationTree tree={selected.escalation_tree || []} />
              </div>

              {/* Lockdown Controls */}
              {selected.status === "active" && (
                <div className="bg-red-950/30 border border-red-900 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-3">
                    Lockdown Controls
                  </h3>
                  <textarea
                    placeholder="Enter lockdown actions (one per line)"
                    value={lockdownActions}
                    onChange={(e) => setLockdownActions(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-chamber-900 border border-red-800 rounded-lg text-white text-sm mb-3"
                  />
                  <button
                    onClick={executeLockdown}
                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg"
                  >
                    Execute Lockdown
                  </button>
                </div>
              )}

              {/* Lockdown Actions Display */}
              {(selected.lockdown_actions || []).length > 0 && (
                <div className="bg-chamber-900 border border-chamber-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Executed Lockdown Actions
                  </h3>
                  <ul className="space-y-1">
                    {selected.lockdown_actions.map((action, i) => (
                      <li
                        key={i}
                        className="text-chamber-300 text-sm flex items-center gap-2"
                      >
                        <span className="text-red-400">&#9632;</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resolve */}
              {selected.status !== "resolved" && (
                <div className="bg-green-950/20 border border-green-900 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-3">
                    Resolve Incident
                  </h3>
                  <textarea
                    placeholder="Resolution notes..."
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-chamber-900 border border-green-800 rounded-lg text-white text-sm mb-3"
                  />
                  <button
                    onClick={resolveIncident}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-chamber-500">
              Select an incident to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
