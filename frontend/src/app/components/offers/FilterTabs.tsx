'use client';

import React from 'react';

export type OfferStatus =
  | 'All'
  | 'Active'
  | 'Draft'
  | 'In Negotiation'
  | 'Pending Approval'
  | 'Sunset'
  | 'Needs Attention';

const TABS: OfferStatus[] = [
  'All',
  'Active',
  'Draft',
  'In Negotiation',
  'Pending Approval',
  'Sunset',
  'Needs Attention',
];

interface FilterTabsProps {
  counts: Record<OfferStatus, number>;
  activeTab: OfferStatus;
  onTabChange: (tab: OfferStatus) => void;
}

export default function FilterTabs({
  counts,
  activeTab,
  onTabChange,
}: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        const isAttention = tab === 'Needs Attention';
        const count = counts[tab] ?? 0;

        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
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
                  isAttention && count > 0
                    ? 'bg-red-500/20 text-red-400'
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
