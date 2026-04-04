'use client';

import React, { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Inline data                                                        */
/* ------------------------------------------------------------------ */

type TabKey = 'current' | 'talking' | 'attention' | 'past';

interface Tab {
  key: TabKey;
  label: string;
  count: number;
}

const TABS: Tab[] = [
  { key: 'current', label: 'Current clients', count: 3 },
  { key: 'talking', label: "People you're talking to", count: 2 },
  { key: 'attention', label: 'Needs attention', count: 1 },
  { key: 'past', label: 'Past clients', count: 1 },
];

type HealthColor = 'green' | 'red' | 'gold' | 'purple' | 'blue';

interface ClientRow {
  id: string;
  person: string;
  company?: string;
  health: string;
  healthColor: HealthColor;
  monthly: string | null;
  nextStep: string;
  tab: TabKey;
}

const COLOR_STYLES: Record<HealthColor, string> = {
  green: 'bg-emerald-500/20 text-emerald-400',
  red: 'bg-red-500/20 text-red-400',
  gold: 'bg-[#C9A84C]/20 text-[#C9A84C]',
  purple: 'bg-purple-500/20 text-purple-300',
  blue: 'bg-blue-500/20 text-blue-400',
};

const DOT_STYLES: Record<HealthColor, string> = {
  green: 'bg-emerald-400',
  red: 'bg-red-400',
  gold: 'bg-[#C9A84C]',
  purple: 'bg-purple-400',
  blue: 'bg-blue-400',
};

const CLIENTS: ClientRow[] = [
  {
    id: '1',
    person: 'Sarah Chen',
    health: 'Happy and engaged',
    healthColor: 'green',
    monthly: '$22,000',
    nextStep: "Keep doing what you're doing",
    tab: 'current',
  },
  {
    id: '2',
    person: 'Wellington Trust',
    health: "Worried — you haven't talked in 12 days",
    healthColor: 'red',
    monthly: '$18,000',
    nextStep: 'Call them today — they feel forgotten',
    tab: 'attention',
  },
  {
    id: '3',
    person: 'Harrington Dynasty',
    health: 'Your best client — thriving',
    healthColor: 'green',
    monthly: '$35,000',
    nextStep: 'Think about offering them more services',
    tab: 'current',
  },
  {
    id: '4',
    person: 'Marcus Reid',
    health: 'New — just sold his company for $120M',
    healthColor: 'gold',
    monthly: null,
    nextStep: "He's ready to talk. Set up a call.",
    tab: 'talking',
  },
  {
    id: '5',
    person: 'Elizabeth Thornton',
    health: 'Former client — just inherited $45M',
    healthColor: 'purple',
    monthly: null,
    nextStep: 'Great time to reconnect',
    tab: 'past',
  },
  {
    id: '6',
    person: 'Diana Walsh',
    health: "Interested but hasn't committed yet",
    healthColor: 'blue',
    monthly: null,
    nextStep: 'Send her the playbook summary',
    tab: 'talking',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SimpleClientsContent() {
  const [activeTab, setActiveTab] = useState<TabKey | 'all'>('all');

  const filtered =
    activeTab === 'all'
      ? CLIENTS
      : CLIENTS.filter((c) => c.tab === activeTab);

  const atRisk = CLIENTS.filter((c) => c.healthColor === 'red');

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-white">Your people</h1>

      {/* At-risk prompt */}
      {atRisk.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">
            You haven&apos;t spoken to Wellington Trust in 12 days. That&apos;s
            too long — clients feel forgotten after 7 days.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <TabButton
          label="All"
          count={CLIENTS.length}
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        />
        {TABS.map((t) => (
          <TabButton
            key={t.key}
            label={t.label}
            count={t.count}
            active={activeTab === t.key}
            attention={t.key === 'attention'}
            onClick={() => setActiveTab(t.key)}
          />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#1e2a3a]">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[#1e2a3a] text-[10px] uppercase tracking-wider text-gray-500">
              <th className="p-3">Person &amp; company</th>
              <th className="p-3">How are they doing</th>
              <th className="p-3">Money per month</th>
              <th className="p-3">Next step</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#1e2a3a] hover:bg-[#111827] transition-colors"
              >
                <td className="p-3">
                  <span className="font-medium text-white">{row.person}</span>
                  {row.company && (
                    <span className="block text-[11px] text-gray-500">
                      {row.company}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${DOT_STYLES[row.healthColor]}`}
                    />
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${COLOR_STYLES[row.healthColor]}`}
                    >
                      {row.health}
                    </span>
                  </span>
                </td>
                <td className="p-3 text-gray-200">
                  {row.monthly ?? (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="p-3 text-gray-300 text-xs">{row.nextStep}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No people in this category yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab button                                                         */
/* ------------------------------------------------------------------ */

function TabButton({
  label,
  count,
  active,
  attention,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  attention?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
        whitespace-nowrap transition-colors border
        ${
          active
            ? 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]'
            : 'bg-transparent text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#111827]'
        }
      `}
    >
      {label}
      <span
        className={`
          text-[10px] px-1.5 py-0.5 rounded-full font-semibold
          ${
            attention && count > 0
              ? 'bg-red-500/20 text-red-400'
              : active
                ? 'bg-[#C9A84C]/30 text-[#C9A84C]'
                : 'bg-gray-700 text-gray-400'
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}
