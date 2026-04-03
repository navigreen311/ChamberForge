"use client";

interface Stage {
  name: string;
  duration: string;
  touchpoints: string[];
  deliverables: string[];
  success_criteria: string;
}

interface JourneyMap {
  stages: Stage[];
  total_duration: string;
}

interface Props {
  journeyMap: JourneyMap;
}

export default function JourneyMapViewer({ journeyMap }: Props) {
  const { stages, total_duration } = journeyMap;

  if (!stages || stages.length === 0) {
    return <p className="text-chamber-400">No journey map data available.</p>;
  }

  return (
    <div>
      <p className="text-sm text-chamber-400 mb-4">
        Total Duration: {total_duration}
      </p>

      {/* Horizontal timeline */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-64 bg-chamber-900 border border-chamber-800 rounded-lg p-4"
          >
            {/* Stage header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gold-500 text-chamber-950 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white leading-tight">
                  {stage.name}
                </h3>
                <p className="text-xs text-chamber-500">{stage.duration}</p>
              </div>
            </div>

            {/* Touchpoints */}
            <div className="mb-3">
              <p className="text-xs text-chamber-500 font-medium mb-1">Touchpoints</p>
              <ul className="space-y-0.5">
                {stage.touchpoints.map((tp, j) => (
                  <li key={j} className="text-xs text-chamber-300">
                    &bull; {tp}
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="mb-3">
              <p className="text-xs text-chamber-500 font-medium mb-1">Deliverables</p>
              <ul className="space-y-0.5">
                {stage.deliverables.map((d, j) => (
                  <li key={j} className="text-xs text-chamber-300">
                    &bull; {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* Success criteria */}
            <div className="border-t border-chamber-800 pt-2">
              <p className="text-xs text-chamber-500 font-medium mb-1">
                Success Criteria
              </p>
              <p className="text-xs text-chamber-300">{stage.success_criteria}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
