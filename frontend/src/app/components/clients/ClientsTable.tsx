'use client';

import React from 'react';

export interface KPIDot {
  label: string;
  status: 'green' | 'amber' | 'red';
}

export interface Client {
  id: string;
  name: string;
  company: string;
  trustChannel: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  status: string;
  painFocusTags: string[];
  lastContact: string;
  lastContactDays: number;
  wealthEvent?: string;
  health: number;
  trend: 'up' | 'down' | 'flat';
  kpiDots: KPIDot[];
  retainer: string;
  renewalDate: string;
  renewalDays: number;
  channel: string;
}

interface ClientsTableProps {
  clients: Client[];
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
  'At Risk': 'bg-red-500/20 text-red-400',
  Onboarding: 'bg-blue-500/20 text-blue-400',
  Inactive: 'bg-gray-500/20 text-gray-400',
  VIP: 'bg-[#C9A84C]/20 text-[#C9A84C]',
  'Needs Attention': 'bg-orange-500/20 text-orange-400',
};

function lastContactColor(days: number): string {
  if (days <= 7) return 'text-emerald-400';
  if (days <= 30) return 'text-yellow-400';
  return 'text-red-400';
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up')
    return <span className="text-emerald-400 text-xs ml-1">&#9650;</span>;
  if (trend === 'down')
    return <span className="text-red-400 text-xs ml-1">&#9660;</span>;
  return <span className="text-gray-500 text-xs ml-1">&#9644;</span>;
}

function contextAction(client: Client): string {
  if (client.status === 'At Risk') return 'Intervene';
  if (client.renewalDays <= 30) return 'Renew';
  if (client.lastContactDays > 30) return 'Reach Out';
  if (client.wealthEvent) return 'Brief';
  return 'View';
}

export default function ClientsTable({
  clients,
  onSelect,
  selectedId,
}: ClientsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-[#1e2a3a] text-[10px] uppercase tracking-wider text-gray-500">
            <th className="p-3 w-8">
              <input type="checkbox" className="accent-[#C9A84C]" />
            </th>
            <th className="p-3">Client / Company</th>
            <th className="p-3">Tier</th>
            <th className="p-3">Status</th>
            <th className="p-3">Pain Focus</th>
            <th className="p-3">Last Contact</th>
            <th className="p-3">Wealth Event</th>
            <th className="p-3">Health</th>
            <th className="p-3">KPIs</th>
            <th className="p-3">Retainer</th>
            <th className="p-3">Renewal</th>
            <th className="p-3">Channel</th>
            <th className="p-3 w-10">Action</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const isSelected = selectedId === client.id;
            return (
              <tr
                key={client.id}
                onClick={() => onSelect(client.id)}
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
                    onChange={() => onSelect(client.id)}
                    className="accent-[#C9A84C]"
                  />
                </td>

                {/* Client / Company */}
                <td className="p-3">
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="text-[11px] text-gray-500">{client.company}</div>
                  <div className="text-[10px] text-gray-600">{client.trustChannel}</div>
                </td>

                {/* Tier */}
                <td className="p-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${TIER_COLORS[client.tier] ?? ''}`}
                  >
                    {client.tier}
                  </span>
                </td>

                {/* Status */}
                <td className="p-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[client.status] ?? 'bg-gray-500/20 text-gray-400'}`}
                  >
                    {client.status}
                  </span>
                </td>

                {/* Pain Focus Tags */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {client.painFocusTags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e2a3a] text-gray-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Last Contact */}
                <td className="p-3">
                  <span className={`text-xs ${lastContactColor(client.lastContactDays)}`}>
                    {client.lastContact}
                  </span>
                  <div className="text-[10px] text-gray-600">
                    {client.lastContactDays}d ago
                  </div>
                </td>

                {/* Wealth Event */}
                <td className="p-3">
                  {client.wealthEvent ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C]">
                      {client.wealthEvent}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-600">—</span>
                  )}
                </td>

                {/* Health + Trend */}
                <td className="p-3">
                  <span className="text-gray-200">{client.health}%</span>
                  <TrendIcon trend={client.trend} />
                </td>

                {/* KPI Dots */}
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {client.kpiDots.map((dot, i) => (
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

                {/* Retainer */}
                <td className="p-3 text-gray-200 text-xs">{client.retainer}</td>

                {/* Renewal */}
                <td className="p-3">
                  <div className="text-gray-200 text-xs">{client.renewalDate}</div>
                  <div
                    className={`text-[10px] ${
                      client.renewalDays <= 30
                        ? 'text-red-400'
                        : client.renewalDays <= 90
                          ? 'text-yellow-400'
                          : 'text-gray-500'
                    }`}
                  >
                    {client.renewalDays}d
                  </div>
                </td>

                {/* Channel */}
                <td className="p-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {client.channel}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3">
                  <button className="text-[10px] px-2 py-1 rounded bg-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C]/30 transition-colors whitespace-nowrap">
                    {contextAction(client)}
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
