'use client';

import React from 'react';

export type ClientTab =
  | 'All'
  | 'Active'
  | 'At Risk'
  | 'Onboarding'
  | 'Inactive'
  | 'VIP'
  | 'Needs Attention';

const TABS: ClientTab[] = [
  'All',
  'Active',
  'At Risk',
  'Onboarding',
  'Inactive',
  'VIP',
  'Needs Attention',
];

const TAB_BADGE_COLORS: Partial<Record<ClientTab, string>> = {
  'At Risk': 'bg-red-500/20 text-red-400',
  'Needs Attention': 'bg-orange-500/20 text-orange-400',
  VIP: 'bg-[#C9A84C]/30 text-[#C9A84C]',
};

interface FilterTabsProps {
  counts: Record<ClientTab, number>;
  activeTab: ClientTab;
  onChange: (tab: ClientTab) => void;
}

export default function FilterTabs({
  counts,
  activeTab,
  onChange,
}: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        const count = counts[tab] ?? 0;
        const specialColor = TAB_BADGE_COLORS[tab];

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              whitespace-nowrap transition-colors border
              ${
                isActive
                  ? 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#111827]'
              }
            `}
          >
            {tab}
            <span
              className={`
                text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                ${
                  specialColor && count > 0
                    ? specialColor
                    : isActive
                      ? 'bg-[#C9A84C]/30 text-[#C9A84C]'
                      : 'bg-gray-700 text-gray-400'
                }
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
