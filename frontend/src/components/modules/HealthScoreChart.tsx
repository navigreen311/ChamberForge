"use client";

interface DataPoint {
  month: string;
  score: number;
}

interface HealthScoreChartProps {
  data: DataPoint[];
}

/**
 * Small SVG sparkline showing 6-month health score trend.
 * No external chart library needed — pure SVG.
 */
export default function HealthScoreChart({ data }: HealthScoreChartProps) {
  if (!data || data.length < 2) {
    return <span className="text-chamber-600 text-sm">No data</span>;
  }

  const width = 120;
  const height = 32;
  const padding = 2;

  const scores = data.map((d) => d.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = scores.map((s, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - padding * 2);
    const y = height - padding - ((s - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const lastScore = scores[scores.length - 1];
  const strokeColor =
    lastScore >= 80 ? "#4ade80" : lastScore >= 60 ? "#facc15" : "#f87171";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on latest value */}
      {(() => {
        const last = points[points.length - 1].split(",");
        return (
          <circle
            cx={last[0]}
            cy={last[1]}
            r={3}
            fill={strokeColor}
          />
        );
      })()}
    </svg>
  );
}
