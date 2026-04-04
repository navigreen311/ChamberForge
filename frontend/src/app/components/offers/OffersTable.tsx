'use client';

import React from 'react';

export interface DealDeskPill {
  label: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface KPIDot {
  label: string;
  status: 'green' | 'amber' | 'red';
}

export interface Offer {
  id: string;
  name: string;
  client: string;
  draftProgress?: number;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  status: string;
  monthly: string;
  delivery: string;
  dealDesk: DealDeskPill[];
  kpiDots: KPIDot[];
  redTeamScore?: number;
  health: number;
  trend: 'up' | 'down' | 'flat';
  renewalDate: string;
  renewalDays: number;
  nextAction: string;
}

interface OffersTableProps {
  offers: Offer[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

const TIER_COLORS: Record<string, string> = {
  Platinum: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  Gold: 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/40',
  Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/40',
  Bronze: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
};

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400',
  Draft: 'bg-gray-500/20 text-gray-400',
  'In Negotiation': 'bg-blue-500/20 text-blue-400',
  'Pending Approval': 'bg-yellow-500/20 text-yellow-400',
  Sunset: 'bg-orange-500/20 text-orange-400',
  'Needs Attention': 'bg-red-500/20 text-red-400',
};

const DEAL_DESK_COLORS: Record<string, string> = {
  approved: 'bg-emerald-500/20 text-emerald-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  rejected: 'bg-red-500/20 text-red-400',
};

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up')
    return <span className="text-emerald-400 text-xs ml-1">&#9650;</span>;
  if (trend === 'down')
    return <span className="text-red-400 text-xs ml-1">&#9660;</span>;
  return <span className="text-gray-500 text-xs ml-1">&#9644;</span>;
}

export default function OffersTable({
  offers,
  onSelect,
  selectedId,
}: OffersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-[#1e2a3a] text-[10px] uppercase tracking-wider text-gray-500">
            <th className="p-3 w-8">
              <input type="checkbox" className="accent-[#C9A84C]" />
            </th>
            <th className="p-3">Offer / Client</th>
            <th className="p-3">Tier</th>
            <th className="p-3">Status</th>
            <th className="p-3">Monthly</th>
            <th className="p-3">Delivery</th>
            <th className="p-3">Deal Desk</th>
            <th className="p-3">KPIs</th>
            <th className="p-3">Red Team</th>
            <th className="p-3">Health</th>
            <th className="p-3">Renewal</th>
            <th className="p-3">Next Action</th>
            <th className="p-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const isSelected = selectedId === offer.id;
            return (
              <tr
                key={offer.id}
                onClick={() => onSelect(offer.id)}
                className={`
                  border-b border-[#1e2a3a] cursor-pointer transition-colors
                  ${isSelected ? 'bg-[#C9A84C]/5' : 'hover:bg-[#111827]'}
                `}
              >
                {/* Checkbox */}
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(offer.id)}
                    className="accent-[#C9A84C]"
                  />
                </td>

                {/* Offer / Client */}
                <td className="p-3">
                  <div className="font-medium text-white">{offer.name}</div>
                  <div className="text-[11px] text-gray-500">{offer.client}</div>
                  {offer.draftProgress !== undefined && (
                    <div className="mt-1 w-24 h-1 bg-[#1e2a3a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C9A84C] rounded-full"
                        style={{ width: `${offer.draftProgress}%` }}
                      />
                    </div>
                  )}
                </td>

                {/* Tier */}
                <td className="p-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${TIER_COLORS[offer.tier] ?? ''}`}
                  >
                    {offer.tier}
                  </span>
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[offer.status] ?? 'bg-gray-500/20 text-gray-400'}`}
                  >
                    {offer.status}
                  </span>
                </td>

                {/* Monthly */}
                <td className="p-3 text-gray-200">{offer.monthly}</td>

                {/* Delivery */}
                <td className="p-3 text-gray-300 text-xs">{offer.delivery}</td>

                {/* Deal Desk */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {offer.dealDesk.map((pill, i) => (
                      <span
                        key={i}
                        className={`text-[9px] px-1.5 py-0.5 rounded ${DEAL_DESK_COLORS[pill.status]}`}
                      >
                        {pill.label}
                      </span>
                    ))}
                  </div>
                </td>

                {/* KPI Dots */}
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {offer.kpiDots.map((dot, i) => (
                      <span
                        key={i}
                        title={dot.label}
                        className={`w-2 h-2 rounded-full ${
                          dot.status === 'green'
                            ? 'bg-emerald-400'
                            : dot.status === 'amber'
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                        }`}
                      />
                    ))}
                  </div>
                </td>

                {/* Red Team */}
                <td className="p-3">
                  {offer.redTeamScore !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        offer.redTeamScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : offer.redTeamScore >= 50
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {offer.redTeamScore}%
                    </span>
                  )}
                </td>

                {/* Health + Trend */}
                <td className="p-3">
                  <span className="text-gray-200">{offer.health}%</span>
                  <TrendIcon trend={offer.trend} />
                </td>

                {/* Renewal */}
                <td className="p-3">
                  <div className="text-gray-200 text-xs">{offer.renewalDate}</div>
                  <div
                    className={`text-[10px] ${
                      offer.renewalDays <= 30
                        ? 'text-red-400'
                        : offer.renewalDays <= 90
                          ? 'text-yellow-400'
                          : 'text-gray-500'
                    }`}
                  >
                    {offer.renewalDays}d
                  </div>
                </td>

                {/* Next Action */}
                <td className="p-3 text-xs text-gray-300">{offer.nextAction}</td>

                {/* Actions */}
                <td className="p-3">
                  <button className="text-gray-500 hover:text-gray-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
