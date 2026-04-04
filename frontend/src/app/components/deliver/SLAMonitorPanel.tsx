'use client';

interface SLAClientData {
  client: string;
  onTime: number;
  total: number;
}

interface SLAMonitorData {
  overall: { onTime: number; total: number };
  clients: SLAClientData[];
}

interface SLAMonitorPanelProps {
  data: SLAMonitorData;
}

function SLABar({ label, percentage }: { label: string; percentage: number }) {
  const color =
    percentage >= 95
      ? 'bg-emerald-400'
      : percentage >= 80
        ? 'bg-amber-400'
        : 'bg-red-400';

  const textColor =
    percentage >= 95
      ? 'text-emerald-400'
      : percentage >= 80
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 w-32 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-sm font-medium w-12 text-right ${textColor}`}>
        {percentage.toFixed(0)}%
      </span>
    </div>
  );
}

export default function SLAMonitorPanel({ data }: SLAMonitorPanelProps) {
  const overallPct = data.overall.total > 0
    ? (data.overall.onTime / data.overall.total) * 100
    : 0;

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider">SLA Monitor</h3>

      {/* Overall bar */}
      <div className="pb-3 border-b border-[#1e2a3a]">
        <SLABar label="Overall" percentage={overallPct} />
        <p className="text-[10px] text-gray-500 mt-1 ml-[140px]">
          {data.overall.onTime} of {data.overall.total} on time
        </p>
      </div>

      {/* Per-client bars */}
      <div className="space-y-3">
        {data.clients.map((c) => {
          const pct = c.total > 0 ? (c.onTime / c.total) * 100 : 0;
          return <SLABar key={c.client} label={c.client} percentage={pct} />;
        })}
      </div>
    </div>
  );
}
