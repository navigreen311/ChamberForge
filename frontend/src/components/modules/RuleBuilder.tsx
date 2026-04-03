"use client";

import { useState } from "react";

const TRIGGER_TYPES = [
  "wealth_event_detected",
  "client_health_below",
  "regulatory_alert",
  "kpi_below_sla",
  "offer_status_changed",
];

const ACTION_TYPES = [
  "create_task",
  "send_alert",
  "open_risk_review",
  "trigger_escalation",
  "send_email",
];

interface RuleBuilderProps {
  onCreated: (rule: {
    id: string;
    name: string;
    trigger_type: string;
    action_type: string;
    is_active: boolean;
    execution_count: number;
  }) => void;
}

export default function RuleBuilder({ onCreated }: RuleBuilderProps) {
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState(TRIGGER_TYPES[0]);
  const [conditionsJson, setConditionsJson] = useState("{}");
  const [actionType, setActionType] = useState(ACTION_TYPES[0]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate JSON
    try {
      JSON.parse(conditionsJson);
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON in conditions");
      return;
    }

    if (!name.trim()) return;

    onCreated({
      id: crypto.randomUUID(),
      name,
      trigger_type: triggerType,
      action_type: actionType,
      is_active: true,
      execution_count: 0,
    });

    // Reset
    setName("");
    setConditionsJson("{}");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-chamber-900 border border-gold-500/30 rounded-lg p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-white mb-2">
        Create Automation Rule
      </h3>

      {/* Rule Name */}
      <div>
        <label className="block text-chamber-300 text-sm mb-1">Rule Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Alert on low client health"
          className="w-full bg-chamber-800 border border-chamber-700 rounded px-3 py-2 text-white text-sm placeholder:text-chamber-600 focus:border-gold-500 focus:outline-none"
          required
        />
      </div>

      {/* Trigger Type */}
      <div>
        <label className="block text-chamber-300 text-sm mb-1">
          Trigger Type
        </label>
        <select
          value={triggerType}
          onChange={(e) => setTriggerType(e.target.value)}
          className="w-full bg-chamber-800 border border-chamber-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
        >
          {TRIGGER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Conditions JSON */}
      <div>
        <label className="block text-chamber-300 text-sm mb-1">
          Trigger Conditions (JSON)
        </label>
        <textarea
          value={conditionsJson}
          onChange={(e) => {
            setConditionsJson(e.target.value);
            setJsonError(null);
          }}
          rows={4}
          className={`w-full bg-chamber-800 border rounded px-3 py-2 text-white text-sm font-mono focus:outline-none ${
            jsonError
              ? "border-red-500"
              : "border-chamber-700 focus:border-gold-500"
          }`}
        />
        {jsonError && (
          <div className="text-red-400 text-xs mt-1">{jsonError}</div>
        )}
      </div>

      {/* Action Type */}
      <div>
        <label className="block text-chamber-300 text-sm mb-1">
          Action Type
        </label>
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="w-full bg-chamber-800 border border-chamber-700 rounded px-3 py-2 text-white text-sm focus:border-gold-500 focus:outline-none"
        >
          {ACTION_TYPES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="bg-gold-500 text-chamber-950 px-6 py-2 rounded font-semibold text-sm hover:bg-gold-400"
      >
        Create Rule
      </button>
    </form>
  );
}
