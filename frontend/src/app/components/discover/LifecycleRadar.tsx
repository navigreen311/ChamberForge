'use client';

interface LifecycleStage {
  label: string;
  percentage: number;
  count: number;
}

interface LifecycleRadarProps {
  stages: LifecycleStage[];
}

const stageColors: Record<string, string> = {
  Emerging: 'bg-blue-500',
  Accelerating: 'bg-emerald-500',
  Proven: 'bg-purple-500',
  Saturated: 'bg-gray-500',
  Declining: 'bg-red-500',
};

export default function LifecycleRadar({ stages }: LifecycleRadarProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3">
      <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
        Lifecycle Distribution
      </h3>
      <div className="space-y-2.5">
        {stages.map((stage) => (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{stage.label}</span>
              <span className="text-[10px] text-gray-500">{stage.count}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  stageColors[stage.label] || 'bg-gray-500'
                }`}
                style={{ width: `${Math.min(stage.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
