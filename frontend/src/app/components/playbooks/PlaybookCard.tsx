'use client';

import React from 'react';

export type PlaybookCategory =
  | 'security'
  | 'coordination'
  | 'governance'
  | 'privacy'
  | 'medical'
  | 'travel'
  | 'property';

export type DeliveryModel = 'managed' | 'self-serve' | 'hybrid' | 'white-glove';
export type Tier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type Lifecycle = 'draft' | 'active' | 'sunset' | 'archived';

export interface PlaybookData {
  id: string;
  name: string;
  category: PlaybookCategory;
  tier: Tier;
  lifecycle: Lifecycle;
  deliveryModel: DeliveryModel;
  price: string;
  targetClient: string;
  painPoint: string;
  activeClients: number;
  avgMRR: string;
  closedWon: number;
  nps: number;
  readiness: number;
  needsRedTeam: boolean;
  integrations: { vf: boolean; va: boolean; dd: boolean; tp: boolean };
}

interface PlaybookCardProps {
  playbook: PlaybookData;
  onSelect: (id: string) => void;
  onActivate: (id: string) => void;
  onRedTeam: (id: string) => void;
}

const CATEGORY_COLORS: Record<PlaybookCategory, string> = {
  security: '#E24B4A',
  coordination: '#1D9E75',
  governance: '#534AB7',
  privacy: '#BA7517',
  medical: '#3B6D11',
  travel: '#185FA5',
  property: '#D97706',
};

const TIER_STYLES: Record<Tier, string> = {
  platinum: 'bg-gray-300/10 text-gray-300 border-gray-300/30',
  gold: 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30',
  silver: 'bg-gray-400/10 text-gray-400 border-gray-400/30',
  bronze: 'bg-amber-700/10 text-amber-600 border-amber-700/30',
};

const LIFECYCLE_STYLES: Record<Lifecycle, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  sunset: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  archived: 'bg-gray-600/10 text-gray-500 border-gray-600/30',
};

export default function PlaybookCard({
  playbook,
  onSelect,
  onActivate,
  onRedTeam,
}: PlaybookCardProps) {
  const accentColor = CATEGORY_COLORS[playbook.category];
  const integrations = playbook.integrations;

  const INTEGRATION_BADGES: { key: keyof typeof integrations; label: string }[] = [
    { key: 'vf', label: 'VF' },
    { key: 'va', label: 'VA' },
    { key: 'dd', label: 'DD' },
    { key: 'tp', label: 'TP' },
  ];

  return (
    <div
      className="relative bg-[#111827] border border-[#1e2a3a] rounded-lg overflow-hidden cursor-pointer hover:border-[#C9A84C]/30 transition-colors"
      onClick={() => onSelect(playbook.id)}
    >
      {/* 3px accent bar */}
      <div className="h-[3px] w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-4">
        {/* Header + Price */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">
              {playbook.name}
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              {playbook.category}
            </p>
          </div>
          <span className="text-sm font-semibold text-[#C9A84C]">
            {playbook.price}
          </span>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${TIER_STYLES[playbook.tier]}`}
          >
            {playbook.tier}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border ${LIFECYCLE_STYLES[playbook.lifecycle]}`}
          >
            {playbook.lifecycle}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
            {playbook.deliveryModel}
          </span>
          {playbook.needsRedTeam && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border bg-red-500/10 text-red-400 border-red-500/30">
              Red-team
            </span>
          )}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
            {playbook.activeClients} clients
          </span>
        </div>

        {/* Target + Pain */}
        <div className="mb-3 space-y-1">
          <p className="text-[11px] text-gray-400">
            <span className="text-gray-500 font-medium">Target:</span>{' '}
            {playbook.targetClient}
          </p>
          <p className="text-[11px] text-gray-400">
            <span className="text-gray-500 font-medium">Pain:</span>{' '}
            {playbook.painPoint}
          </p>
        </div>

        {/* 4-col stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Clients', value: String(playbook.activeClients) },
            { label: 'Avg MRR', value: playbook.avgMRR },
            { label: 'Won', value: String(playbook.closedWon) },
            { label: 'NPS', value: String(playbook.nps) },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[10px] text-gray-500 uppercase">{stat.label}</p>
              <p className="text-xs font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Readiness bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500 uppercase">Readiness</span>
            <span className="text-[10px] font-medium text-gray-300">
              {playbook.readiness}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${playbook.readiness}%`,
                backgroundColor:
                  playbook.readiness >= 80
                    ? '#10b981'
                    : playbook.readiness >= 50
                      ? '#f59e0b'
                      : '#ef4444',
              }}
            />
          </div>
        </div>

        {/* Integration badges */}
        <div className="flex items-center gap-1.5 mb-3">
          {INTEGRATION_BADGES.map((badge) => (
            <span
              key={badge.key}
              className={`inline-flex items-center justify-center w-7 h-5 rounded text-[9px] font-bold
                ${
                  integrations[badge.key]
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#1e2a3a] text-gray-600 border border-[#1e2a3a]'
                }
              `}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActivate(playbook.id);
            }}
            className="flex-1 py-1.5 rounded-md text-[11px] font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors"
          >
            Activate
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRedTeam(playbook.id);
            }}
            className="flex-1 py-1.5 rounded-md text-[11px] font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Red-Team
          </button>
        </div>
      </div>
    </div>
  );
}
