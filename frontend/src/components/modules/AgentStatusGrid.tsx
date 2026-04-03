"use client";

interface AgentStatus {
  [agentName: string]: string;
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
}: {
  statuses: AgentStatus;
}) {
  const agents = Object.entries(statuses);

  return (
    <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-chamber-400">
        Agent Status
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {agents.map(([name, status]) => {
          const cfg = statusConfig[status] ?? statusConfig.idle;
          return (
            <div
              key={name}
              className="flex items-center gap-2 rounded-lg bg-chamber-800 px-3 py-2"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">
                  {formatAgentName(name)}
                </p>
                <p className="text-[10px] text-chamber-400">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
