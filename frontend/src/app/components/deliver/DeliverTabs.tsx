'use client';

type DeliverTab =
  | 'all'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'overdue'
  | 'onboarding'
  | 'escalations';

interface DeliverTabsCounts {
  all: number;
  in_progress: number;
  review: number;
  completed: number;
  overdue: number;
  onboarding: number;
  escalations: number;
}

interface DeliverTabsProps {
  counts: DeliverTabsCounts;
  activeTab: DeliverTab;
  onChange: (tab: DeliverTab) => void;
}

const TAB_CONFIG: { key: DeliverTab; label: string; badgeColor: string }[] = [
  { key: 'all', label: 'All', badgeColor: 'bg-gray-600 text-gray-200' },
  { key: 'in_progress', label: 'In Progress', badgeColor: 'bg-blue-900/60 text-blue-400' },
  { key: 'review', label: 'Review', badgeColor: 'bg-amber-900/60 text-amber-400' },
  { key: 'completed', label: 'Completed', badgeColor: 'bg-emerald-900/60 text-emerald-400' },
  { key: 'overdue', label: 'Overdue', badgeColor: 'bg-red-900/60 text-red-400' },
  { key: 'onboarding', label: 'Onboarding', badgeColor: 'bg-purple-900/60 text-purple-400' },
  { key: 'escalations', label: 'Escalations', badgeColor: 'bg-orange-900/60 text-orange-400' },
];

export default function DeliverTabs({ counts, activeTab, onChange }: DeliverTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-[#1e2a3a]">
      {TAB_CONFIG.map(({ key, label, badgeColor }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === key
              ? 'border-[#C9A84C] text-white'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          {label}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${badgeColor}`}
          >
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
