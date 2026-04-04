'use client';

import React from 'react';

export interface AtRiskClient {
  id: string;
  name: string;
  reason: string;
  health: number;
  status: string;
  severity: 'red' | 'amber';
}

interface AtRiskPanelProps {
  clients: AtRiskClient[];
  onAction: (id: string) => void;
}

const SEVERITY_BORDER: Record<string, string> = {
  red: 'border-l-red-500',
  amber: 'border-l-yellow-500',
};

export default function AtRiskPanel({ clients, onAction }: AtRiskPanelProps) {
  return (
    <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
        At-Risk Clients
      </h3>
      <div className="space-y-2">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`
              bg-[#0D1117] border border-[#1e2a3a] rounded-md p-3
              border-l-2 ${SEVERITY_BORDER[client.severity]}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {client.name}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {client.reason}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                <div className="text-right">
                  <span
                    className={`text-[10px] font-medium ${
                      client.health < 50 ? 'text-red-400' : 'text-yellow-400'
                    }`}
                  >
                    {client.health}%
                  </span>
                  <span
                    className={`text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full ${
                      client.status === 'At Risk'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
                <button
                  onClick={() => onAction(client.id)}
                  className="text-[11px] text-[#C9A84C] hover:underline whitespace-nowrap"
                >
                  Intervene &rarr;
                </button>
              </div>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            No at-risk clients
          </p>
        )}
      </div>
    </div>
  );
}
