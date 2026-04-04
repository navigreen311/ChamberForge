'use client';

import { useState } from 'react';

type ViewMode = 'cards' | 'table' | 'ranked';

interface SearchAndToolbarProps {
  resultCount: number;
  onSearchChange?: (query: string) => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: ViewMode) => void;
}

export default function SearchAndToolbar({
  resultCount,
  onSearchChange,
  onSortChange,
  onViewChange,
}: SearchAndToolbarProps) {
  const [view, setView] = useState<ViewMode>('cards');
  const [search, setSearch] = useState('');

  const handleViewChange = (v: ViewMode) => {
    setView(v);
    onViewChange?.(v);
  };

  const viewBtn = (mode: ViewMode, label: string) => (
    <button
      onClick={() => handleViewChange(mode)}
      className={`px-2.5 py-1 text-xs rounded transition-colors ${
        view === mode
          ? 'bg-[#1e2a3a] text-white'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onSearchChange?.(e.target.value);
        }}
        placeholder="Search problems..."
        className="flex-1 bg-[#111827] border border-[#1e2a3a] rounded-md px-3 py-1.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]"
      />
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {resultCount} results
      </span>
      <select
        onChange={(e) => onSortChange?.(e.target.value)}
        className="bg-[#111827] border border-[#1e2a3a] rounded-md px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#C9A84C]"
      >
        <option value="score">Sort: Score</option>
        <option value="urgency">Sort: Urgency</option>
        <option value="wtp">Sort: WTP</option>
        <option value="recent">Sort: Recent</option>
      </select>
      <div className="flex items-center bg-[#111827] border border-[#1e2a3a] rounded-md overflow-hidden">
        {viewBtn('cards', 'Cards')}
        {viewBtn('table', 'Table')}
        {viewBtn('ranked', 'Ranked')}
      </div>
    </div>
  );
}
