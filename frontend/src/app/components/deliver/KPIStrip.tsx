'use client';

interface KPIItem {
  label: string;
  value: string | number;
  trend?: string;
  direction?: 'up' | 'down';
}

interface KPIStripProps {
  items: KPIItem[];
}

export default function KPIStrip({ items }: KPIStripProps) {
  return (
    <div className="grid grid-cols-6 gap-4 w-full">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4"
        >
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            {item.label}
          </p>
          <p className="text-xl font-semibold text-white mt-1">
            {item.value}
          </p>
          {item.trend && (
            <p
              className={`text-[11px] mt-1 ${
                item.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {item.direction === 'up' ? '▲' : '▼'} {item.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
