'use client';

import { useState } from 'react';

const wealthTiers = ['UHNW', 'HNW', 'Affluent', 'Mass Affluent'];
const painCategories = [
  'All Categories',
  'Tax & Estate',
  'Investment',
  'Insurance',
  'Banking',
  'Lifestyle',
];
const lifecycleStages = [
  'Emerging',
  'Accelerating',
  'Proven',
  'Saturated',
  'Declining',
];
const urgencyLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];

export default function FilterPanel() {
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [painCategory, setPainCategory] = useState('All Categories');
  const [selectedLifecycle, setSelectedLifecycle] = useState<string[]>([]);
  const [urgency, setUrgency] = useState('All');

  const toggleChip = (
    value: string,
    selected: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value]
    );
  };

  const clearAll = () => {
    setSelectedTiers([]);
    setPainCategory('All Categories');
    setSelectedLifecycle([]);
    setUrgency('All');
  };

  const chipClass = (active: boolean) =>
    active
      ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]'
      : 'bg-[#1e2a3a] text-gray-400 border border-transparent';

  return (
    <div className="w-[260px] shrink-0 space-y-5">
      {/* Wealth Tier */}
      <div>
        <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
          Wealth Tier
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {wealthTiers.map((tier) => (
            <button
              key={tier}
              onClick={() => toggleChip(tier, selectedTiers, setSelectedTiers)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${chipClass(
                selectedTiers.includes(tier)
              )}`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Pain Category */}
      <div>
        <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
          Pain Category
        </h3>
        <select
          value={painCategory}
          onChange={(e) => setPainCategory(e.target.value)}
          className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#C9A84C]"
        >
          {painCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Lifecycle */}
      <div>
        <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
          Lifecycle
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {lifecycleStages.map((stage) => (
            <button
              key={stage}
              onClick={() =>
                toggleChip(stage, selectedLifecycle, setSelectedLifecycle)
              }
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${chipClass(
                selectedLifecycle.includes(stage)
              )}`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div>
        <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
          Urgency
        </h3>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#C9A84C]"
        >
          {urgencyLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Clear All */}
      <button
        onClick={clearAll}
        className="w-full text-xs text-gray-500 hover:text-gray-300 py-1.5 transition-colors"
      >
        Clear All
      </button>
    </div>
  );
}
