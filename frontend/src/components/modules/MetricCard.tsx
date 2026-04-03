"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
  trend: "up" | "down" | "flat";
  sparkline?: number[];
}

const trendConfig = {
  up: { arrow: "\u25B2", color: "text-green-400" },
  down: { arrow: "\u25BC", color: "text-red-400" },
  flat: { arrow: "\u2014", color: "text-chamber-400" },
};

export default function MetricCard({
  label,
  value,
  trend,
  sparkline = [],
}: MetricCardProps) {
  const { arrow, color } = trendConfig[trend];

  return (
    <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-4">
      <p className="text-xs uppercase tracking-wider text-chamber-400">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className={`text-sm font-semibold ${color}`}>{arrow}</span>
      </div>

      {/* Mini sparkline bar chart */}
      {sparkline.length > 0 && (
        <div className="mt-3 flex items-end gap-px h-6">
          {sparkline.map((v, i) => {
            const max = Math.max(...sparkline);
            const pct = max > 0 ? (v / max) * 100 : 0;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-gold-400/60"
                style={{ height: `${pct}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
