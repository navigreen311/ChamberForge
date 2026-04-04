'use client';

import React, { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Inline data                                                        */
/* ------------------------------------------------------------------ */

type TabKey =
  | 'running'
  | 'building'
  | 'talking'
  | 'review'
  | 'winding'
  | 'attention';

interface Tab {
  key: TabKey;
  label: string;
  count: number;
}

const TABS: Tab[] = [
  { key: 'running', label: 'Running now', count: 3 },
  { key: 'building', label: 'Still building', count: 2 },
  { key: 'talking', label: 'Talking to a client', count: 1 },
  { key: 'review', label: 'Waiting on review', count: 1 },
  { key: 'winding', label: 'Winding down', count: 1 },
  { key: 'attention', label: 'Needs your help', count: 2 },
];

type Health = 'Going great' | 'Doing ok' | 'Needs attention' | 'At risk — act now';
type HealthColor = 'green' | 'amber' | 'red';

interface ServiceRow {
  id: string;
  name: string;
  client: string;
  health: Health;
  healthColor: HealthColor;
  monthly: string;
  nextAction: string;
  tab: TabKey;
}

const HEALTH_STYLES: Record<HealthColor, string> = {
  green: 'bg-emerald-500/20 text-emerald-400',
  amber: 'bg-yellow-500/20 text-yellow-400',
  red: 'bg-red-500/20 text-red-400',
};

const STATUS_DOT: Record<HealthColor, string> = {
  green: 'bg-emerald-400',
  amber: 'bg-yellow-400',
  red: 'bg-red-400',
};

const SERVICES: ServiceRow[] = [
  {
    id: '1',
    name: 'Private Ops Office',
    client: 'Sarah Chen',
    health: 'Going great',
    healthColor: 'green',
    monthly: '$22,000/mo',
    nextAction: 'Everything looks good — no action needed',
    tab: 'running',
  },
  {
    id: '2',
    name: 'Family Cyber Command',
    client: 'Wellington Trust',
    health: 'Going great',
    healthColor: 'green',
    monthly: '$18,000/mo',
    nextAction: 'Fix the issues found in the safety check',
    tab: 'building',
  },
  {
    id: '3',
    name: 'Ecosystem Orchestrator',
    client: 'Harrington Dynasty',
    health: 'Going great',
    healthColor: 'green',
    monthly: '$35,000/mo',
    nextAction: 'Time for a quarterly check-in',
    tab: 'running',
  },
  {
    id: '4',
    name: 'Footprint Reduction',
    client: 'Marcus Reid',
    health: 'Doing ok',
    healthColor: 'amber',
    monthly: '$12,000/mo',
    nextAction: 'Send them the proposal',
    tab: 'talking',
  },
  {
    id: '5',
    name: 'Medical Navigation',
    client: 'Thornton',
    health: 'Needs attention',
    healthColor: 'amber',
    monthly: '$15,000/mo',
    nextAction: 'Finish the handoff plan',
    tab: 'winding',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SimpleOffersContent() {
  const [activeTab, setActiveTab] = useState<TabKey | 'all'>('all');

  const filtered =
    activeTab === 'all'
      ? SERVICES
      : SERVICES.filter((s) => s.tab === activeTab);

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-white">Your services</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <TabButton
          label="All"
          count={SERVICES.length}
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
              <th className="p-3">Service name</th>
              <th className="p-3">Client</th>
              <th className="p-3">How it&apos;s going</th>
              <th className="p-3">Monthly income</th>
              <th className="p-3">What to do next</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#1e2a3a] hover:bg-[#111827] transition-colors"
              >
                <td className="p-3 font-medium text-white">{row.name}</td>
                <td className="p-3 text-gray-300">{row.client}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${STATUS_DOT[row.healthColor]}`}
                    />
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${HEALTH_STYLES[row.healthColor]}`}
                    >
                      {row.health}
                    </span>
                  </span>
                </td>
                <td className="p-3 text-gray-200">{row.monthly}</td>
                <td className="p-3 text-gray-300 text-xs">{row.nextAction}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No services in this category yet.
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
