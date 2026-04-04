'use client';

import React from 'react';

export type ViewMode = 'table' | 'cards' | 'board';

interface OffersToolbarProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: string) => void;
  onFilterTier: (tier: string) => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'mrr', label: 'MRR' },
  { value: 'status', label: 'Status' },
  { value: 'renewal', label: 'Renewal Date' },
  { value: 'health', label: 'Health Score' },
];

const TIER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
];

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'table', label: 'Table' },
  { value: 'cards', label: 'Cards' },
  { value: 'board', label: 'Board' },
];

export default function OffersToolbar({
  onSearch,
  onSort,
  onFilterTier,
  activeView,
  onViewChange,
}: OffersToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative" style={{ width: 240 }}>
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search offers..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md pl-8 pr-3 py-1.5
                     text-sm text-gray-200 placeholder-gray-500
                     focus:outline-none focus:border-[#C9A84C]/50"
        />
      </div>

      {/* Sort */}
      <select
        onChange={(e) => onSort(e.target.value)}
        className="bg-[#111827] border border-[#1e2a3a] rounded-md px-3 py-1.5
                   text-sm text-gray-200 focus:outline-none focus:border-[#C9A84C]/50"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>

      {/* Tier Filter */}
      <select
        onChange={(e) => onFilterTier(e.target.value)}
        className="bg-[#111827] border border-[#1e2a3a] rounded-md px-3 py-1.5
                   text-sm text-gray-200 focus:outline-none focus:border-[#C9A84C]/50"
      >
        {TIER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* View Toggle */}
      <div className="flex items-center bg-[#111827] border border-[#1e2a3a] rounded-md overflow-hidden ml-auto">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onViewChange(opt.value)}
            className={`
              px-3 py-1.5 text-xs font-medium transition-colors
              ${
                activeView === opt.value
                  ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                  : 'text-gray-400 hover:text-gray-200'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
