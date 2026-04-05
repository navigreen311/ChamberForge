'use client';

import Link from 'next/link';

interface Schedule {
  scanType: string;
  frequency: string;
  sourcesChecked: string;
  lastRun: string;
}

interface ScanScheduleProps {
  nextScan: string;
  nextScanType: string;
  schedules: Schedule[];
}

function formatNextScan(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} at ${time}`;
}

const typeColors: Record<string, string> = {
  'Real-time': 'bg-emerald-500/20 text-emerald-400',
  'Daily': 'bg-blue-500/20 text-blue-400',
  'Weekly Deep': 'bg-purple-500/20 text-purple-400',
  'Monthly Comprehensive': 'bg-amber-500/20 text-amber-400',
};

export default function ScanSchedule({ nextScan, nextScanType, schedules }: ScanScheduleProps) {
  return (
    <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
      <h3 className="mb-3 text-xs font-medium tracking-wider text-gray-500">SCAN SCHEDULE</h3>

      {/* Next scheduled scan */}
      <div className="mb-3 rounded-lg bg-[#0D1117] border border-[#1e2a3a] px-3 py-2">
        <div className="text-[10px] text-gray-500 mb-0.5">Next scheduled scan</div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white">
            {formatNextScan(nextScan)}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeColors[nextScanType] || 'bg-gray-500/20 text-gray-400'}`}
          >
            {nextScanType}
          </span>
        </div>
      </div>

      {/* Schedule table */}
      <div className="overflow-hidden rounded-lg border border-[#1e2a3a]">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-[#1e2a3a] bg-[#0D1117]">
              <th className="px-2 py-1.5 text-left font-medium text-gray-500">Scan type</th>
              <th className="px-2 py-1.5 text-left font-medium text-gray-500">Frequency</th>
              <th className="px-2 py-1.5 text-left font-medium text-gray-500">Sources</th>
              <th className="px-2 py-1.5 text-right font-medium text-gray-500">Last run</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2a3a]">
            {schedules.map((s) => (
              <tr key={s.scanType} className="hover:bg-[#1e2a3a]/30">
                <td className="px-2 py-1.5 text-gray-300 whitespace-nowrap">{s.scanType}</td>
                <td className="px-2 py-1.5 text-gray-400">{s.frequency}</td>
                <td className="px-2 py-1.5 text-gray-400">{s.sourcesChecked}</td>
                <td className="px-2 py-1.5 text-right text-gray-400">{s.lastRun}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Change schedule link */}
      <div className="mt-2.5 text-right">
        <Link
          href="/settings/integrations"
          className="text-[10px] text-[#C9A84C] hover:text-[#B8973B] hover:underline"
        >
          Change schedule →
        </Link>
      </div>
    </div>
  );
}
