'use client';

import React, { useState } from 'react';

export type BriefType = 'quick' | 'full' | 'combined';

export interface BriefSection {
  title: string;
  content: string;
}

interface PreMeetingBriefModalProps {
  clientName: string;
  clientTier: string;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (briefType: BriefType, context: string) => void;
  isGenerating?: boolean;
  result?: BriefSection[];
}

const BRIEF_OPTIONS: { value: BriefType; label: string; description: string }[] = [
  { value: 'quick', label: 'Quick', description: '2-min summary' },
  { value: 'full', label: 'Full', description: 'Comprehensive brief' },
  { value: 'combined', label: 'Combined', description: 'Multi-source analysis' },
];

export default function PreMeetingBriefModal({
  clientName,
  clientTier,
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  result,
}: PreMeetingBriefModalProps) {
  const [briefType, setBriefType] = useState<BriefType>('quick');
  const [context, setContext] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#111827] border border-[#1e2a3a] rounded-xl w-[560px] max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e2a3a]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Pre-Meeting Brief
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {clientName}{' '}
              <span className="text-[#C9A84C]">{clientTier}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Brief Type Selection */}
        <div className="p-5 border-b border-[#1e2a3a]">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium block mb-3">
            Brief Type
          </label>
          <div className="flex gap-2">
            {BRIEF_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBriefType(opt.value)}
                className={`
                  flex-1 p-3 rounded-lg border text-left transition-colors
                  ${
                    briefType === opt.value
                      ? 'border-[#C9A84C] bg-[#C9A84C]/10'
                      : 'border-[#1e2a3a] bg-[#0D1117] hover:border-gray-600'
                  }
                `}
              >
                <div
                  className={`text-xs font-medium ${
                    briefType === opt.value ? 'text-[#C9A84C]' : 'text-gray-300'
                  }`}
                >
                  {opt.label}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {opt.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Context Input */}
        <div className="p-5 border-b border-[#1e2a3a]">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium block mb-2">
            Additional Context
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Meeting agenda, specific topics to cover, concerns..."
            rows={3}
            className="w-full bg-[#0D1117] border border-[#1e2a3a] rounded-md px-3 py-2
                       text-sm text-gray-200 placeholder-gray-600
                       focus:outline-none focus:border-[#C9A84C]/50 resize-none"
          />
        </div>

        {/* Generate Button */}
        <div className="p-5 border-b border-[#1e2a3a]">
          <button
            onClick={() => onGenerate(briefType, context)}
            disabled={isGenerating}
            className={`
              w-full py-2.5 rounded-md text-sm font-medium transition-colors
              ${
                isGenerating
                  ? 'bg-[#C9A84C]/30 text-[#C9A84C]/60 cursor-not-allowed'
                  : 'bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90'
              }
            `}
          >
            {isGenerating ? 'Generating...' : 'Generate Brief'}
          </button>
        </div>

        {/* Result Preview */}
        {result && result.length > 0 && (
          <div className="p-5">
            <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-3">
              Brief Preview
            </h4>
            <div className="space-y-4">
              {result.map((section, idx) => (
                <div key={idx}>
                  <h5 className="text-xs font-semibold text-[#C9A84C] mb-1">
                    {section.title}
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
