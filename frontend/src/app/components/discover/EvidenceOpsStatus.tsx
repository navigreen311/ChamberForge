'use client';

interface StatusRow {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'error' | 'neutral';
}

interface EvidenceOpsStatusProps {
  rows: StatusRow[];
}

const statusColors: Record<StatusRow['status'], string> = {
  good: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  neutral: 'text-gray-300',
};

export default function EvidenceOpsStatus({ rows }: EvidenceOpsStatusProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3">
      <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
        Evidence Ops
      </h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{row.label}</span>
            <span className={`text-xs font-medium ${statusColors[row.status]}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
