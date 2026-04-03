"use client";

import { useState } from "react";

interface AgentStatus {
  [agentName: string]: string;
}

interface AgentDetail {
  status: string;
  last_output?: string;
}

const statusConfig: Record<string, { dot: string; label: string }> = {
  idle: { dot: "bg-green-400", label: "Idle" },
  running: { dot: "bg-blue-400 animate-pulse", label: "Running" },
  complete: { dot: "bg-emerald-400", label: "Complete" },
  error: { dot: "bg-red-400", label: "Error" },
};

function formatAgentName(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function AgentStatusGrid({
  statuses,
  details,
}: {
  statuses: AgentStatus;
  details?: Record<string, AgentDetail>;
}) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const agents = Object.entries(statuses);

  const selectedDetail = selectedAgent
    ? details?.[selectedAgent]
    : null;

  return (
    <>
      <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-chamber-400">
          Agent Status
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {agents.map(([name, status]) => {
            const cfg = statusConfig[status] ?? statusConfig.idle;
            return (
              <button
                key={name}
                onClick={() => setSelectedAgent(name)}
                className="flex items-center gap-2 rounded-lg bg-chamber-800 px-3 py-2 hover:bg-chamber-700 transition text-left w-full"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">
                    {formatAgentName(name)}
                  </p>
                  <p className="text-[10px] text-chamber-400">{cfg.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent Output Modal */}
      {selectedAgent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedAgent(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-chamber-700 bg-chamber-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {formatAgentName(selectedAgent)} — Last Output
              </h3>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-chamber-400 hover:text-white transition text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="rounded-lg bg-chamber-800 p-4 max-h-80 overflow-y-auto">
              <pre className="text-sm text-chamber-200 whitespace-pre-wrap break-words">
                {selectedDetail?.last_output || "No output available for this agent."}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
