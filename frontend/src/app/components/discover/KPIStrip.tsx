'use client';

interface KPIItem {
  label: string;
  value: string | number;
  trend: string;
  trendColor?: string;
}

interface KPIStripProps {
  items: KPIItem[];
}

export default function KPIStrip({ items }: KPIStripProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3"
        >
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            {item.label}
          </p>
          <p className="text-lg font-semibold text-white mt-1">{item.value}</p>
          <p
            className={`text-[11px] mt-0.5 ${
              item.trendColor || 'text-gray-400'
            }`}
          >
            {item.trend}
          </p>
        </div>
      ))}
    </div>
  );
}
