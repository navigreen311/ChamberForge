'use client';

type ScanStatus = 'Complete' | 'Partial' | 'Failed';

interface ScanEntry {
  timestamp: string;
  newProblems: number;
  status: ScanStatus;
}

interface ScanHistoryProps {
  scans: ScanEntry[];
}

const statusStyles: Record<ScanStatus, string> = {
  Complete: 'bg-emerald-900/30 text-emerald-400',
  Partial: 'bg-amber-900/30 text-amber-400',
  Failed: 'bg-red-900/30 text-red-400',
};

export default function ScanHistory({ scans }: ScanHistoryProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3">
      <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
        Scan History
      </h3>
      <div className="space-y-2">
        {scans.map((scan, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{scan.timestamp}</span>
              <span className="text-xs text-emerald-400">
                +{scan.newProblems} problems
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyles[scan.status]}`}
            >
              {scan.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
