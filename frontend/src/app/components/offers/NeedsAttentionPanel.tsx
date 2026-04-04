'use client';

import React from 'react';

export interface AttentionItem {
  id: string;
  offerName: string;
  severity: 'red' | 'amber';
  reasons: string[];
  fixUrl?: string;
}

interface NeedsAttentionPanelProps {
  items: AttentionItem[];
}

export default function NeedsAttentionPanel({ items }: NeedsAttentionPanelProps) {
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-xs text-gray-500 py-4 text-center">
          No offers need attention
        </p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className={`
            bg-[#111827] border border-[#1e2a3a] rounded-lg p-3
            border-l-2
            ${item.severity === 'red' ? 'border-l-red-500' : 'border-l-yellow-500'}
          `}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-white">{item.offerName}</span>
          </div>
          <ul className="space-y-1 mb-2">
            {item.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-400">
                <span
                  className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    item.severity === 'red' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}
                />
                {reason}
              </li>
            ))}
          </ul>
          <a
            href={item.fixUrl ?? '#'}
            className="text-[11px] text-[#C9A84C] hover:text-[#C9A84C]/80 font-medium transition-colors"
          >
            Fix now &rarr;
          </a>
        </div>
      ))}
    </div>
  );
}
