'use client';

import { useEffect } from 'react';

interface EvidenceItem {
  source: string;
  credibility: number;
  claim: string;
  type: 'regulatory' | 'industry_report' | 'internal';
}

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  evidence: EvidenceItem[];
}

const typeBadge: Record<EvidenceItem['type'], { label: string; classes: string }> = {
  regulatory: { label: 'Regulatory', classes: 'bg-red-900/50 text-red-400' },
  industry_report: { label: 'Industry Report', classes: 'bg-blue-900/50 text-blue-400' },
  internal: { label: 'Internal', classes: 'bg-green-900/50 text-green-400' },
};

export default function EvidenceDrawer({ open, onClose, evidence }: EvidenceDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-[#111827] border-l border-[#1e2a3a] z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a3a]">
          <h2 className="text-lg font-semibold text-white">Evidence Chain</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Evidence list */}
        <div className="px-6 py-4 space-y-0">
          {evidence.map((item, idx) => {
            const badge = typeBadge[item.type];
            return (
              <div key={idx} className="border-l-2 border-[#C9A84C] pl-4 mb-4">
                <p className="font-medium text-white">{item.source}</p>
                <span
                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 ${badge.classes}`}
                >
                  {badge.label}
                </span>
                {/* Credibility bar */}
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-gray-700 rounded">
                    <div
                      className="h-1.5 bg-emerald-400 rounded"
                      style={{ width: `${item.credibility * 10}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 italic mt-2">{item.claim}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
