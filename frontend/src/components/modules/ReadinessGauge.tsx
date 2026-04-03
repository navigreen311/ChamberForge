"use client";

interface ReadinessGaugeProps {
  score: number; // 0-100
  size?: number; // px, default 160
}

export default function ReadinessGauge({ score, size = 160 }: ReadinessGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  let color: string;
  let label: string;
  if (clamped >= 70) {
    color = "#22c55e"; // green
    label = "Ready";
  } else if (clamped >= 40) {
    color = "#eab308"; // yellow
    label = "Developing";
  } else {
    color = "#ef4444"; // red
    label = "Not Ready";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={8}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-3xl font-bold text-white">{clamped}</span>
        <span className="text-xs uppercase tracking-wider text-white/50">
          {label}
        </span>
      </div>
    </div>
  );
}
