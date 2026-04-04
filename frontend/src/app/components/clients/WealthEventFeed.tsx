'use client';

import React from 'react';

export interface WealthEvent {
  id: string;
  type: 'exit' | 'inheritance' | 'ipo' | 'liquidity' | 'board';
  clientName: string;
  description: string;
  time: string;
}

interface WealthEventFeedProps {
  events: WealthEvent[];
  onViewAll?: () => void;
}

const DOT_COLORS: Record<string, string> = {
  exit: 'bg-[#C9A84C]',
  inheritance: 'bg-purple-400',
  ipo: 'bg-emerald-400',
  liquidity: 'bg-blue-400',
  board: 'bg-blue-400',
};

export default function WealthEventFeed({
  events,
  onViewAll,
}: WealthEventFeedProps) {
  return (
    <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
        Wealth Events
      </h3>
      <div>
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 py-3 border-b border-[#1e2a3a] last:border-0"
          >
            <div
              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                DOT_COLORS[event.type] ?? 'bg-gray-400'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-white">{event.clientName}</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {event.description}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">{event.time}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            No recent wealth events
          </p>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="mt-3 text-[11px] text-[#C9A84C] hover:underline"
        >
          All events &rarr;
        </button>
      )}
    </div>
  );
}
