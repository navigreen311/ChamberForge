'use client';

interface Onboarding {
  id: string;
  clientName: string;
  stage: string;
  progress: number; // 0–100
  stagesCompleted: number;
  totalStages: number;
}

interface OnboardingPipelineProps {
  onboardings: Onboarding[];
}

function getProgressColor(progress: number): string {
  if (progress >= 80) return 'bg-emerald-400';
  if (progress >= 50) return 'bg-amber-400';
  return 'bg-blue-400';
}

export default function OnboardingPipeline({ onboardings }: OnboardingPipelineProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        Onboarding Pipeline
      </h3>

      <div className="space-y-3">
        {onboardings.map((ob) => (
          <div
            key={ob.id}
            className="bg-[#0d1117] border border-[#1e2a3a] rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{ob.clientName}</span>
              <span className="text-[10px] text-gray-500">
                {ob.stagesCompleted}/{ob.totalStages} stages
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a2332] text-gray-400 border border-[#1e2a3a]">
                {ob.stage}
              </span>
            </div>

            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(ob.progress)} transition-all`}
                style={{ width: `${ob.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{ob.progress}% complete</p>
          </div>
        ))}

        {onboardings.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">No active onboardings</p>
        )}
      </div>
    </div>
  );
}
