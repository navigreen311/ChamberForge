'use client';

import React from 'react';
import HouseholdGraphMini from './HouseholdGraphMini';

export interface Touchpoint {
  type: string;
  description: string;
  time: string;
}

export interface ClientDetail {
  id: string;
  name: string;
  avatarUrl?: string;
  tier: string;
  status: string;
  health: number;
  retainer: string;
  lastContact: string;
  renewalDate: string;
  channel: string;
  householdPeople: number;
  householdVendors: number;
  householdProperties: number;
  recentTouchpoints: Touchpoint[];
}

interface ClientDetailPanelProps {
  client: ClientDetail;
  onClose: () => void;
  onOpenGraph?: () => void;
  onGenerateBrief?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400',
  'At Risk': 'bg-red-500/20 text-red-400',
  Onboarding: 'bg-blue-500/20 text-blue-400',
  Inactive: 'bg-gray-500/20 text-gray-400',
  VIP: 'bg-[#C9A84C]/20 text-[#C9A84C]',
};

const TOUCHPOINT_ICONS: Record<string, string> = {
  call: 'bg-blue-400',
  email: 'bg-emerald-400',
  meeting: 'bg-[#C9A84C]',
  note: 'bg-purple-400',
};

export default function ClientDetailPanel({
  client,
  onClose,
  onOpenGraph,
  onGenerateBrief,
}: ClientDetailPanelProps) {
  return (
    <div className="w-[300px] bg-[#111827] border-l border-[#1e2a3a] h-full overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1e2a3a] flex items-center justify-center text-sm font-semibold text-[#C9A84C] overflow-hidden">
            {client.avatarUrl ? (
              <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover" />
            ) : (
              client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{client.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A84C]/20 text-[#C9A84C]">
                {client.tier}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_COLORS[client.status] ?? 'bg-gray-500/20 text-gray-400'}`}
              >
                {client.status}
              </span>
            </div>
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

      {/* Household Graph Mini */}
      <div className="p-4 border-b border-[#1e2a3a]">
        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          Household Graph
        </h4>
        <HouseholdGraphMini
          people={client.householdPeople}
          vendors={client.householdVendors}
          properties={client.householdProperties}
        />
        <button
          onClick={onOpenGraph}
          className="mt-2 text-[11px] text-[#C9A84C] hover:underline"
        >
          Open graph &rarr;
        </button>
      </div>

      {/* Key Metrics */}
      <div className="p-4 border-b border-[#1e2a3a]">
        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          Key Metrics
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Health', value: `${client.health}%` },
            { label: 'Retainer', value: client.retainer },
            { label: 'Last Contact', value: client.lastContact },
            { label: 'Renewal', value: client.renewalDate },
            { label: 'Channel', value: client.channel },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-gray-500">{row.label}</span>
              <span className="text-gray-200">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Touchpoints */}
      <div className="p-4 border-b border-[#1e2a3a]">
        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          Recent Touchpoints
        </h4>
        <div className="space-y-3">
          {client.recentTouchpoints.slice(0, 3).map((tp, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  TOUCHPOINT_ICONS[tp.type] ?? 'bg-gray-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">{tp.description}</p>
                <p className="text-[10px] text-gray-600">{tp.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={onGenerateBrief}
          className="w-full py-2 rounded-md text-xs font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors"
        >
          Generate Brief
        </button>
        <button className="w-full py-2 rounded-md text-xs font-medium border border-[#1e2a3a] text-gray-300 hover:bg-[#1e2a3a] transition-colors">
          Schedule Meeting
        </button>
        <button className="w-full py-2 rounded-md text-xs font-medium border border-[#1e2a3a] text-gray-300 hover:bg-[#1e2a3a] transition-colors">
          Log Touchpoint
        </button>
      </div>
    </div>
  );
}
