'use client';

import React from 'react';

export type ClientViewMode = 'table' | 'cards';

interface ClientsToolbarProps {
  onSearch: (query: string) => void;
  onFilterTier: (tier: string) => void;
  onSort: (sortBy: string) => void;
  activeView: ClientViewMode;
  onViewChange: (view: ClientViewMode) => void;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'health', label: 'Health Score' },
  { value: 'retainer', label: 'Retainer' },
  { value: 'renewal', label: 'Renewal Date' },
  { value: 'lastContact', label: 'Last Contact' },
];

const TIER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
];

const VIEW_OPTIONS: { value: ClientViewMode; label: string }[] = [
  { value: 'table', label: 'Table' },
  { value: 'cards', label: 'Cards' },
];

export default function ClientsToolbar({
  onSearch,
  onFilterTier,
  onSort,
  activeView,
  onViewChange,
}: ClientsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative" style={{ width: 220 }}>
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
          placeholder="Search clients..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md pl-8 pr-3 py-1.5
                     text-sm text-gray-200 placeholder-gray-500
                     focus:outline-none focus:border-[#C9A84C]/50"
        />
      </div>

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
