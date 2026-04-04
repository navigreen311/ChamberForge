'use client';

import React from 'react';

export interface KPIItem {
  label: string;
  value: string | number;
  subLabel?: string;
}

interface KPIStripProps {
  items: KPIItem[];
}

export default function KPIStrip({ items }: KPIStripProps) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3"
        >
          <p className="text-[10px] uppercase tracking-wider text-gray-400">
            {item.label}
          </p>
          <p className="text-lg font-semibold text-white mt-1">{item.value}</p>
          {item.subLabel && (
            <p className="text-[11px] text-gray-500 mt-0.5">{item.subLabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}
