"use client";

interface Section {
  name: string;
  status: "complete" | "in_progress" | "not_started";
}

interface PlaybookProgressProps {
  playbookName: string;
  completionPct: number;
  sections: Section[];
  nextStep: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  complete: { bg: "bg-emerald-500", text: "text-emerald-400", label: "Complete" },
  in_progress: { bg: "bg-blue-500", text: "text-blue-400", label: "In Progress" },
  not_started: { bg: "bg-chamber-700", text: "text-chamber-500", label: "Not Started" },
};

export default function PlaybookProgress({
  playbookName,
  completionPct,
  sections,
  nextStep,
}: PlaybookProgressProps) {
  return (
    <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{playbookName}</h3>
        <span className="text-sm font-medium text-gold-400">
          {completionPct}% Complete
        </span>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-chamber-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
          style={{ width: `${completionPct}%` }}
        />
      </div>

      {/* Section Breakdown */}
      <div className="space-y-3">
        {sections.map((section) => {
          const style = STATUS_COLORS[section.status] || STATUS_COLORS.not_started;
          return (
            <div
              key={section.name}
              className="flex items-center justify-between rounded-lg bg-chamber-800/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${style.bg}`} />
                <span className="text-sm text-chamber-200">{section.name}</span>
              </div>
              <span className={`text-xs font-medium ${style.text}`}>
                {style.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Next Step */}
      {nextStep && (
        <div className="mt-6 rounded-lg border border-gold-500/20 bg-gold-500/5 px-4 py-3">
          <span className="text-xs font-medium text-gold-400">Next Step:</span>
          <p className="mt-1 text-sm text-white">{nextStep}</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex gap-6">
        {Object.entries(STATUS_COLORS).map(([key, style]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${style.bg}`} />
            <span className="text-xs text-chamber-400">{style.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
