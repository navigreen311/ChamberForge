'use client';

import React from 'react';

export type PlaybookTab = 'all' | 'templates' | 'active' | 'custom' | 'composites' | 'red-team-needed';

interface PlaybookTabsProps {
  activeTab: PlaybookTab;
  onTabChange: (tab: PlaybookTab) => void;
  redTeamCount?: number;
}

const TABS: { value: PlaybookTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'templates', label: 'Templates' },
  { value: 'active', label: 'Active' },
  { value: 'custom', label: 'Custom' },
  { value: 'composites', label: 'Composites' },
  { value: 'red-team-needed', label: 'Red-team Needed' },
];

export default function PlaybookTabs({
  activeTab,
  onTabChange,
  redTeamCount = 0,
}: PlaybookTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-[#1e2a3a]">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`
            relative px-4 py-2.5 text-xs font-medium transition-colors
            ${
              activeTab === tab.value
                ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                : 'text-gray-400 hover:text-gray-200'
            }
          `}
        >
          {tab.label}
          {tab.value === 'red-team-needed' && redTeamCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white">
              {redTeamCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
