'use client';

type SourceStatus = 'active' | 'error' | 'idle';

interface Source {
  name: string;
  status: SourceStatus;
}

interface ScanStatusBarProps {
  statusText: string;
  isRunning: boolean;
  sources: Source[];
}

const pillStyles: Record<SourceStatus, string> = {
  active: 'bg-emerald-900/30 text-emerald-400',
  error: 'bg-red-900/30 text-red-400',
  idle: 'bg-gray-800 text-gray-500',
};

export default function ScanStatusBar({
  statusText,
  isRunning,
  sources,
}: ScanStatusBarProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className={`h-2 w-2 rounded-full ${
          isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
        }`}
      />
      <span className="text-xs text-gray-400">{statusText}</span>
      <div className="flex items-center gap-1.5 ml-2">
        {sources.map((src, i) => (
          <span
            key={i}
            className={`text-[10px] px-2 py-0.5 rounded-full ${pillStyles[src.status]}`}
          >
            {src.name}
          </span>
        ))}
      </div>
    </div>
  );
}
