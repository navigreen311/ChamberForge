'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface DeliverToolbarProps {
  onSearch?: (query: string) => void;
  onClientFilter?: (client: string) => void;
  onTypeFilter?: (type: string) => void;
  onPriorityFilter?: (priority: string) => void;
  onSort?: (sort: string) => void;
  onBulkAction?: (action: string) => void;
  clients?: string[];
  selectedCount?: number;
}

const TYPES = ['All Types', 'Scorecard', 'Report', 'Audit', 'IR Plan', 'Training', 'Assessment'];
const PRIORITIES = ['All Priorities', 'Critical', 'High', 'Medium', 'Low'];
const SORT_OPTIONS = ['SLA (nearest)', 'SLA (farthest)', 'Priority', 'Client A-Z', 'Created (newest)'];
const BULK_ACTIONS = ['Reassign', 'Change Status', 'Export', 'Archive'];

function Dropdown({ label, options, onChange }: { label: string; options: string[]; onChange?: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-[#1a2332] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 hover:border-gray-600 cursor-pointer"
      >
        {selected}
        <ChevronDown size={14} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-[#1a2332] border border-[#1e2a3a] rounded-lg shadow-xl z-20 min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setSelected(opt);
                setOpen(false);
                onChange?.(opt);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#111827] cursor-pointer"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DeliverToolbar({
  onSearch,
  onClientFilter,
  onTypeFilter,
  onPriorityFilter,
  onSort,
  onBulkAction,
  clients = [],
  selectedCount = 0,
}: DeliverToolbarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search deliverables..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full bg-[#1a2332] border border-[#1e2a3a] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]"
        />
      </div>

      {/* Filters */}
      <Dropdown
        label="All Clients"
        options={['All Clients', ...clients]}
        onChange={onClientFilter}
      />
      <Dropdown label="All Types" options={TYPES} onChange={onTypeFilter} />
      <Dropdown label="All Priorities" options={PRIORITIES} onChange={onPriorityFilter} />

      {/* Sort */}
      <Dropdown label="Sort by" options={SORT_OPTIONS} onChange={onSort} />

      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">{selectedCount} selected</span>
          <Dropdown label="Bulk Actions" options={BULK_ACTIONS} onChange={onBulkAction} />
        </div>
      )}
    </div>
  );
}
