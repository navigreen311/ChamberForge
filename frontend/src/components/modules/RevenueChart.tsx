"use client";

import { useMemo } from "react";

interface DataPoint {
  month: string;
  mrr: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  height?: number;
  width?: number;
}

export default function RevenueChart({
  data,
  height = 300,
  width = 700,
}: RevenueChartProps) {
  const padding = { top: 20, right: 30, bottom: 40, left: 70 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const { maxVal, points, areaPath, linePath } = useMemo(() => {
    if (!data.length)
      return { maxVal: 0, points: [], areaPath: "", linePath: "" };
    const max = Math.max(...data.map((d) => d.mrr)) * 1.15 || 1;
    const pts = data.map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
      y: padding.top + chartH - (d.mrr / max) * chartH,
      ...d,
    }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area =
      line +
      ` L${pts[pts.length - 1].x},${padding.top + chartH} L${pts[0].x},${padding.top + chartH} Z`;
    return { maxVal: max, points: pts, areaPath: area, linePath: line };
  }, [data, chartW, chartH, padding.left, padding.top]);

  const yTicks = useMemo(() => {
    const count = 5;
    return Array.from({ length: count + 1 }, (_, i) => {
      const val = (maxVal / count) * i;
      const y = padding.top + chartH - (val / (maxVal || 1)) * chartH;
      return { val, y };
    });
  }, [maxVal, chartH, padding.top]);

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n.toFixed(0)}`;

  if (!data.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-8 text-white/40"
        style={{ height }}>
        No revenue data yet
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padding.left} y1={t.y} x2={width - padding.right} y2={t.y}
            stroke="rgba(255,255,255,0.06)" />
          <text x={padding.left - 8} y={t.y + 4} textAnchor="end"
            className="fill-white/40 text-[11px]">{fmt(t.val)}</text>
        </g>
      ))}

      {/* area fill */}
      <path d={areaPath} fill="url(#revenueGradient)" opacity={0.25} />
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* line */}
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" />

      {/* dots + x-labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#6366f1" stroke="#1e1b4b" strokeWidth={2} />
          <text x={p.x} y={height - 10} textAnchor="middle"
            className="fill-white/40 text-[10px]">{p.month}</text>
        </g>
      ))}
    </svg>
  );
}
