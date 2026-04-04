'use client';

import React from 'react';

export type IncludedStatus = 'included' | 'partial' | 'missing';

export interface IncludedItem {
  label: string;
  status: IncludedStatus;
}

export interface EvidenceCitation {
  title: string;
  source: string;
  credibility: number;
}

export interface CompatiblePlaybook {
  id: string;
  name: string;
  category: string;
}

interface PlaybookDetailPanelProps {
  isOpen: boolean;
  title: string;
  includedItems: IncludedItem[];
  citations: EvidenceCitation[];
  compatiblePlaybooks: CompatiblePlaybook[];
  onClose: () => void;
  onActivate: () => void;
  onCompose: () => void;
}

const STATUS_ICON: Record<IncludedStatus, { icon: string; color: string }> = {
  included: { icon: '\u2713', color: 'text-emerald-400' },
  partial: { icon: '!', color: 'text-amber-400' },
  missing: { icon: '\u2717', color: 'text-red-400' },
};

export default function PlaybookDetailPanel({
  isOpen,
  title,
  includedItems,
  citations,
  compatiblePlaybooks,
  onClose,
  onActivate,
  onCompose,
}: PlaybookDetailPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="w-[300px] flex-shrink-0 bg-[#0D1117] border-l border-[#1e2a3a] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
        <h2 className="text-sm font-semibold text-white truncate">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* What's Included */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">
            What&apos;s Included
          </h3>
          <div className="space-y-1.5">
            {includedItems.map((item, idx) => {
              const si = STATUS_ICON[item.status];
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${si.color} w-4 text-center`}>
                    {si.icon}
                  </span>
                  <span className="text-[11px] text-gray-300">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Citations */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">
            Evidence Citations
          </h3>
          <div className="space-y-2">
            {citations.map((cite, idx) => (
              <div
                key={idx}
                className="bg-[#111827] border border-[#1e2a3a] rounded-md p-2.5"
              >
                <p className="text-[11px] font-medium text-white">{cite.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{cite.source}</p>
                <div className="mt-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-gray-500 uppercase">Credibility</span>
                    <span className="text-[9px] text-gray-400">{cite.credibility}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#1e2a3a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cite.credibility}%`,
                        backgroundColor:
                          cite.credibility >= 80
                            ? '#10b981'
                            : cite.credibility >= 50
                              ? '#f59e0b'
                              : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compatible Playbooks */}
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">
            Compatible Playbooks
          </h3>
          <div className="space-y-1.5">
            {compatiblePlaybooks.map((pb) => (
              <div
                key={pb.id}
                className="flex items-center gap-2 p-2 bg-[#111827] border border-[#1e2a3a] rounded-md"
              >
                <span className="text-[11px] text-gray-300">{pb.name}</span>
                <span className="ml-auto text-[9px] text-gray-500 uppercase">
                  {pb.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-[#1e2a3a] space-y-2">
        <button
          onClick={onActivate}
          className="w-full py-2 rounded-md text-xs font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors"
        >
          Activate Playbook
        </button>
        <button
          onClick={onCompose}
          className="w-full py-2 rounded-md text-xs font-medium border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
        >
          Compose with Others
        </button>
      </div>
    </div>
  );
}
