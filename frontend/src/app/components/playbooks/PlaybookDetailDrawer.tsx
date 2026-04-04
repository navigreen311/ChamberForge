'use client';

import React from 'react';

export interface RedTeamHistoryEntry {
  date: string;
  result: 'pass' | 'fail';
  summary: string;
}

export interface PlaybookFullSpec {
  id: string;
  name: string;
  category: string;
  tier: string;
  price: string;
  icp: string;
  valueStack: string[];
  sops: string[];
  kpis: { label: string; target: string }[];
  trustConcerns: string[];
  objections: { objection: string; response: string }[];
  partners: { name: string; role: string }[];
  pricing: { component: string; amount: string }[];
  redTeamHistory: RedTeamHistoryEntry[];
}

interface PlaybookDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  spec: PlaybookFullSpec | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  security: '#E24B4A',
  coordination: '#1D9E75',
  governance: '#534AB7',
  privacy: '#BA7517',
  medical: '#3B6D11',
  travel: '#185FA5',
  property: '#D97706',
};

export default function PlaybookDetailDrawer({
  isOpen,
  onClose,
  spec,
}: PlaybookDetailDrawerProps) {
  if (!spec) return null;

  const accent = CATEGORY_COLORS[spec.category] || '#6b7280';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[600px] bg-[#0D1117] border-l border-[#1e2a3a]
          z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#1e2a3a]">
          <div className="h-[3px] w-full" style={{ backgroundColor: accent }} />
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="text-base font-semibold text-white">{spec.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-500">
                  {spec.category}
                </span>
                <span className="text-[10px] text-gray-600">&middot;</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500">
                  {spec.tier}
                </span>
                <span className="text-[10px] text-gray-600">&middot;</span>
                <span className="text-xs font-medium text-[#C9A84C]">{spec.price}</span>
              </div>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* ICP */}
          <Section title="Ideal Client Profile">
            <p className="text-[11px] text-gray-300 leading-relaxed">{spec.icp}</p>
          </Section>

          {/* Value Stack */}
          <Section title="Value Stack">
            <div className="space-y-1.5">
              {spec.valueStack.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 text-xs mt-0.5">&#x25C6;</span>
                  <span className="text-[11px] text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* SOPs */}
          <Section title="Standard Operating Procedures">
            <div className="space-y-1.5">
              {spec.sops.map((sop, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-[#111827] border border-[#1e2a3a] rounded-md">
                  <span className="text-[10px] font-mono text-gray-500 mt-0.5 w-5 text-right flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-gray-300">{sop}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* KPIs */}
          <Section title="Key Performance Indicators">
            <div className="grid grid-cols-2 gap-2">
              {spec.kpis.map((kpi, idx) => (
                <div key={idx} className="p-2.5 bg-[#111827] border border-[#1e2a3a] rounded-md">
                  <p className="text-[10px] text-gray-500 uppercase">{kpi.label}</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{kpi.target}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Trust Concerns */}
          <Section title="Trust Concerns">
            <div className="space-y-1.5">
              {spec.trustConcerns.map((concern, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 text-[10px] mt-0.5">&#x26A0;</span>
                  <span className="text-[11px] text-gray-300">{concern}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Objections */}
          <Section title="Common Objections">
            <div className="space-y-2">
              {spec.objections.map((obj, idx) => (
                <div key={idx} className="p-3 bg-[#111827] border border-[#1e2a3a] rounded-md">
                  <p className="text-[11px] text-red-400 font-medium">
                    &ldquo;{obj.objection}&rdquo;
                  </p>
                  <p className="text-[11px] text-gray-300 mt-1.5">
                    <span className="text-emerald-400 font-medium">Response: </span>
                    {obj.response}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Partners */}
          <Section title="Partners">
            <div className="space-y-1.5">
              {spec.partners.map((partner, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#111827] border border-[#1e2a3a] rounded-md">
                  <span className="text-[11px] text-white font-medium">{partner.name}</span>
                  <span className="text-[10px] text-gray-500">{partner.role}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Pricing Breakdown */}
          <Section title="Pricing Breakdown">
            <div className="space-y-1.5">
              {spec.pricing.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#111827] border border-[#1e2a3a] rounded-md">
                  <span className="text-[11px] text-gray-300">{item.component}</span>
                  <span className="text-[11px] font-medium text-[#C9A84C]">{item.amount}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Red-team History */}
          <Section title="Red-Team History">
            <div className="space-y-2">
              {spec.redTeamHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md border ${
                    entry.result === 'pass'
                      ? 'bg-[#111827] border-[#1e2a3a]'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        entry.result === 'pass' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}
                    >
                      {entry.result === 'pass' ? (
                        <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500">{entry.date}</span>
                    <span
                      className={`text-[9px] font-medium uppercase ${
                        entry.result === 'pass' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {entry.result}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 ml-6">{entry.summary}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2.5">
        {title}
      </h3>
      {children}
    </div>
  );
}
