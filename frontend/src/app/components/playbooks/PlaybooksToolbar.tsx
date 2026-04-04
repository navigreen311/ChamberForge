'use client';

import React from 'react';

export type ViewMode = 'grid' | 'list';

interface PlaybooksToolbarProps {
  onSearch: (query: string) => void;
  onFilterTier: (tier: string) => void;
  onFilterCategory: (category: string) => void;
  onFilterDelivery: (delivery: string) => void;
  onSort: (sortBy: string) => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const TIER_OPTIONS = [
  { value: 'all', label: 'All Tiers' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'bronze', label: 'Bronze' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'security', label: 'Security' },
  { value: 'coordination', label: 'Coordination' },
  { value: 'governance', label: 'Governance' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'medical', label: 'Medical' },
  { value: 'travel', label: 'Travel' },
  { value: 'property', label: 'Property' },
];

const DELIVERY_OPTIONS = [
  { value: 'all', label: 'All Delivery' },
  { value: 'managed', label: 'Managed' },
  { value: 'self-serve', label: 'Self-Serve' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'white-glove', label: 'White Glove' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'readiness', label: 'Readiness' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'clients', label: 'Active Clients' },
  { value: 'updated', label: 'Last Updated' },
];

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
];

export default function PlaybooksToolbar({
  onSearch,
  onFilterTier,
  onFilterCategory,
  onFilterDelivery,
  onSort,
  activeView,
  onViewChange,
}: PlaybooksToolbarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
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
          placeholder="Search playbooks..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md pl-8 pr-3 py-1.5
                     text-sm text-gray-200 placeholder-gray-500
                     focus:outline-none focus:border-[#C9A84C]/50"
        />
      </div>

      {/* Tier */}
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

      {/* Category */}
      <select
        onChange={(e) => onFilterCategory(e.target.value)}
        className="bg-[#111827] border border-[#1e2a3a] rounded-md px-3 py-1.5
                   text-sm text-gray-200 focus:outline-none focus:border-[#C9A84C]/50"
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Delivery Model */}
      <select
        onChange={(e) => onFilterDelivery(e.target.value)}
        className="bg-[#111827] border border-[#1e2a3a] rounded-md px-3 py-1.5
                   text-sm text-gray-200 focus:outline-none focus:border-[#C9A84C]/50"
      >
        {DELIVERY_OPTIONS.map((opt) => (
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
