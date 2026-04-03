"use client";

const COLORS: Record<string, string> = {
  emerging: "#22c55e",
  accelerating: "#3b82f6",
  proven: "#eab308",
  saturated: "#f97316",
  declining: "#ef4444",
};

interface TrendRadarProps {
  distribution: Record<string, number>;
}

export default function TrendRadar({ distribution }: TrendRadarProps) {
  const entries = Object.entries(distribution).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-chamber-400">
        No data yet
      </div>
    );
  }

  // Build SVG donut chart slices
  const radius = 70;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const slices = entries.map(([stage, count]) => {
    const pct = count / total;
    const dashLength = pct * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += dashLength;
    return { stage, count, pct, dashLength, offset };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 180 180" width={180} height={180}>
        {slices.map((s) => (
          <circle
            key={s.stage}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={COLORS[s.stage] ?? "#6b7280"}
            strokeWidth={28}
            strokeDasharray={`${s.dashLength} ${circumference - s.dashLength}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-white text-2xl font-bold"
          fontSize={24}
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3">
        {entries.map(([stage, count]) => (
          <div key={stage} className="flex items-center gap-1.5 text-xs text-chamber-200">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[stage] ?? "#6b7280" }}
            />
            <span className="capitalize">{stage}</span>
            <span className="text-chamber-400">({count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
