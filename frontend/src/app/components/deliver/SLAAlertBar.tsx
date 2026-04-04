'use client';

interface SLAAlertItem {
  id: string;
  label: string;
  hoursOverdue: number;
}

interface SLAAlertBarProps {
  items: SLAAlertItem[];
  onResolve: () => void;
}

export default function SLAAlertBar({ items, onResolve }: SLAAlertBarProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 flex items-center gap-3">
      {/* Pulse dot */}
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
      </span>

      <span className="text-red-300 text-sm font-medium whitespace-nowrap">
        {items.length} overdue SLA{items.length > 1 ? 's' : ''}
      </span>

      {/* Overdue pills */}
      <div className="flex items-center gap-2 overflow-x-auto flex-1">
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 bg-red-900/50 text-red-300 text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
          >
            {item.label}
            <span className="text-red-400 font-semibold">
              +{item.hoursOverdue}h
            </span>
          </span>
        ))}
      </div>

      {/* Resolve all link */}
      <button
        onClick={onResolve}
        className="text-red-400 hover:text-red-300 text-sm font-medium whitespace-nowrap underline underline-offset-2 cursor-pointer"
      >
        Resolve all
      </button>
    </div>
  );
}
