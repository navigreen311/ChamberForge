"use client";

const LIFECYCLE_COLORS: Record<string, string> = {
  emerging: "#22c55e",
  accelerating: "#3b82f6",
  proven: "#eab308",
  saturated: "#f97316",
  declining: "#ef4444",
};

interface LifecycleBadgeProps {
  stage: string;
  className?: string;
}

export default function LifecycleBadge({ stage, className = "" }: LifecycleBadgeProps) {
  const color = LIFECYCLE_COLORS[stage?.toLowerCase()] ?? "#6b7280";
  const label = stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : "Unknown";

  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
}
