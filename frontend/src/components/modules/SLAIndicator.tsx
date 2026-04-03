"use client";

interface SLAIndicatorProps {
  percentage: number;
  size?: number;
}

/**
 * Circular gauge showing SLA adherence percentage.
 * Color transitions: green (>= 90%), amber (>= 70%), red (< 70%).
 */
export default function SLAIndicator({ percentage, size = 120 }: SLAIndicatorProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const color =
    percentage >= 90
      ? { stroke: "#10b981", text: "text-emerald-400", label: "Excellent" }
      : percentage >= 70
      ? { stroke: "#f59e0b", text: "text-amber-400", label: "Needs Attention" }
      : { stroke: "#ef4444", text: "text-red-400", label: "Critical" };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-chamber-800"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-mono font-bold ${color.text}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className={`text-xs font-medium ${color.text}`}>{color.label}</span>
    </div>
  );
}
