'use client';

interface Trend {
  name: string;
  source: string;
  direction: 'hot' | 'rising' | 'new' | 'stable';
  color: string;
}

interface TrendRadarProps {
  trends: Trend[];
}

const directionMap: Record<
  Trend['direction'],
  { symbol: string; className: string }
> = {
  hot: { symbol: '\u2191\u2191', className: 'text-red-400' },
  rising: { symbol: '\u2191', className: 'text-emerald-400' },
  new: { symbol: '\u2605', className: 'text-blue-400' },
  stable: { symbol: '\u2192', className: 'text-gray-400' },
};

export default function TrendRadar({ trends }: TrendRadarProps) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3">
      <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
        Trend Radar
      </h3>
      <div className="space-y-2">
        {trends.map((trend, i) => {
          const dir = directionMap[trend.direction];
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: trend.color }}
              />
              <span className="text-xs text-gray-300 flex-1 truncate">
                {trend.name}
              </span>
              <span className="text-[10px] text-gray-500">{trend.source}</span>
              <span className={`text-xs font-medium ${dir.className}`}>
                {dir.symbol}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
