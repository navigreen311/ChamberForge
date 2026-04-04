'use client';

import { X } from 'lucide-react';

interface EvidenceItem {
  source: string;
  credibility: number;
  claim: string;
  type: string;
}

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceItem[];
}

const typeBadgeStyles: Record<string, string> = {
  regulatory: 'bg-red-900/50 text-red-400',
  industry_report: 'bg-blue-900/50 text-blue-400',
  internal: 'bg-emerald-900/50 text-emerald-400',
  peer_reviewed: 'bg-purple-900/50 text-purple-400',
};

function getCredibilityColor(credibility: number): string {
  if (credibility > 8) return 'bg-emerald-400';
  if (credibility >= 6) return 'bg-amber-400';
  return 'bg-red-400';
}

export default function EvidenceDrawer({ isOpen, onClose, evidence }: EvidenceDrawerProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-[420px] bg-[#111827] border-l border-[#1e2a3a] z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#1e2a3a]">
          <h2 className="text-lg font-semibold text-white">Evidence Chain</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
          {evidence.map((item, index) => (
            <div key={index} className="border-l-2 border-[#C9A84C] pl-4 mb-6">
              <div className="flex items-center">
                <span className="text-sm font-medium text-white">{item.source}</span>
                <span
                  className={`inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full ${
                    typeBadgeStyles[item.type] || 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {item.type}
                </span>
              </div>

              {/* Credibility bar */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-full h-1.5 bg-gray-700 rounded-full">
                  <div
                    className={`h-full rounded-full ${getCredibilityColor(item.credibility)}`}
                    style={{ width: `${item.credibility * 10}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                  {item.credibility}/10
                </span>
              </div>

              <p className="text-sm text-gray-400 italic mt-2 leading-relaxed">{item.claim}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
