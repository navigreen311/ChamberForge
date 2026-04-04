'use client';

interface QAEngineData {
  [key: string]: {
    value: string;
    status: 'pass' | 'warn' | 'fail' | 'pending';
  };
}

interface QAEnginePanelProps {
  data: QAEngineData;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pass: { bg: 'bg-emerald-900/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  warn: { bg: 'bg-amber-900/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  fail: { bg: 'bg-red-900/20', text: 'text-red-400', dot: 'bg-red-400' },
  pending: { bg: 'bg-gray-800/50', text: 'text-gray-400', dot: 'bg-gray-500' },
};

export default function QAEnginePanel({ data }: QAEnginePanelProps) {
  const entries = Object.entries(data);

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        QA Engine
      </h3>

      <div className="space-y-1">
        {entries.map(([key, { value, status }]) => {
          const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
          return (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded-lg ${colors.bg}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span className="text-sm text-gray-300">{key}</span>
              </div>
              <span className={`text-sm font-medium ${colors.text}`}>{value}</span>
            </div>
          );
        })}

        {entries.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">No QA data available</p>
        )}
      </div>
    </div>
  );
}
