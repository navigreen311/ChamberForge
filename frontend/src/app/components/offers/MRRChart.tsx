'use client';

import React from 'react';

export interface MRRMonth {
  month: string;
  mrr: number;
}

interface MRRChartProps {
  months: MRRMonth[];
}

export default function MRRChart({ months }: MRRChartProps) {
  const maxMRR = Math.max(...months.map((m) => m.mrr), 1);
  const chartHeight = 160;
  const chartWidth = 400;
  const barWidth = 40;
  const gap = (chartWidth - barWidth * months.length) / (months.length + 1);
  const lastIndex = months.length - 1;

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Max value line */}
        <line
          x1={0}
          y1={10}
          x2={chartWidth}
          y2={10}
          stroke="#1e2a3a"
          strokeDasharray="4 4"
        />
        <text x={chartWidth - 4} y={8} textAnchor="end" className="text-[9px]" fill="#6b7280">
          {maxMRR.toLocaleString()}
        </text>

        {months.map((m, i) => {
          const barHeight = (m.mrr / maxMRR) * (chartHeight - 20);
          const x = gap + i * (barWidth + gap);
          const y = chartHeight - barHeight;
          const isCurrent = i === lastIndex;

          return (
            <g key={m.month}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={isCurrent ? '#10b981' : '#374151'}
              />
              {/* Value on bar */}
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fill={isCurrent ? '#10b981' : '#9ca3af'}
                className="text-[9px]"
              >
                {m.mrr >= 1000 ? `${(m.mrr / 1000).toFixed(0)}k` : m.mrr}
              </text>
              {/* Month label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 16}
                textAnchor="middle"
                fill="#6b7280"
                className="text-[9px]"
              >
                {m.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
