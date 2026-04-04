'use client';

import React from 'react';

interface HouseholdGraphMiniProps {
  people: number;
  vendors: number;
  properties: number;
}

export default function HouseholdGraphMini({
  people,
  vendors,
  properties,
}: HouseholdGraphMiniProps) {
  const total = people + vendors + properties;

  // Generate surrounding circles based on counts
  const nodes: { color: string; count: number }[] = [
    { color: 'bg-blue-400', count: Math.min(people, 4) },
    { color: 'bg-emerald-400', count: Math.min(vendors, 3) },
    { color: 'bg-[#C9A84C]', count: Math.min(properties, 3) },
  ];

  const allCircles = nodes.flatMap((n) =>
    Array.from({ length: n.count }, () => n.color)
  );

  // Position surrounding circles in a ring
  const angleStep = allCircles.length > 0 ? (2 * Math.PI) / allCircles.length : 0;
  const radius = 28;
  const center = 45;

  return (
    <div className="bg-[#0D1117] rounded-lg border border-[#1e2a3a] p-3" style={{ height: 90 }}>
      <div className="flex items-center gap-3 h-full">
        {/* Node visualization */}
        <div className="relative flex-shrink-0" style={{ width: 90, height: 64 }}>
          {/* Center node */}
          <div
            className="absolute w-4 h-4 rounded-full bg-[#C9A84C] border-2 border-[#C9A84C]/40"
            style={{
              left: center - 8,
              top: 32 - 8,
            }}
          />
          {/* Surrounding nodes */}
          {allCircles.map((color, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle) - 4;
            const y = 32 + radius * Math.sin(angle) - 4;
            return (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${color}`}
                style={{ left: x, top: y }}
              />
            );
          })}
          {/* Connection lines (SVG) */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            {allCircles.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const x = center + radius * Math.cos(angle);
              const y = 32 + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={32}
                  x2={x}
                  y2={y}
                  stroke="#1e2a3a"
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400">
            <span className="text-white font-medium">{people}</span> people
            <span className="text-gray-600 mx-1">&middot;</span>
            <span className="text-white font-medium">{vendors}</span> vendors
            <span className="text-gray-600 mx-1">&middot;</span>
            <span className="text-white font-medium">{properties}</span> properties
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            {total} total nodes
          </p>
        </div>
      </div>
    </div>
  );
}
