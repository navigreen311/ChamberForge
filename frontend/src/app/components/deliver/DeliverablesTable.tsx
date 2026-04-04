'use client';

import { CheckCircle, Circle, MoreHorizontal } from 'lucide-react';

interface Deliverable {
  id: string;
  name: string;
  type: 'Scorecard' | 'Report' | 'Audit' | 'IR Plan' | 'Training' | 'Assessment';
  client: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  slaHours: number;
  slaOverdue: boolean;
  assignee: { name: string; avatar?: string };
  qaChecks: { passed: number; total: number };
  portalPublished: boolean;
  vaScore?: number;
  vfScore?: number;
  selected?: boolean;
}

interface DeliverablesTableProps {
  deliverables: Deliverable[];
  onSelect: (id: string) => void;
  onQAClick: (deliverable: Deliverable) => void;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  Scorecard: 'bg-emerald-900/50 text-emerald-400',
  Report: 'bg-blue-900/50 text-blue-400',
  Audit: 'bg-purple-900/50 text-purple-400',
  'IR Plan': 'bg-amber-900/50 text-amber-400',
  Training: 'bg-yellow-900/50 text-yellow-400',
  Assessment: 'bg-red-900/50 text-red-400',
};

const PRIORITY_BADGE_COLORS: Record<string, string> = {
  Critical: 'bg-red-900/50 text-red-400 border border-red-800',
  High: 'bg-orange-900/50 text-orange-400',
  Medium: 'bg-amber-900/50 text-amber-400',
  Low: 'bg-gray-700 text-gray-400',
};

function SLACell({ hours, overdue }: { hours: number; overdue: boolean }) {
  const color = overdue
    ? 'text-red-400'
    : hours <= 4
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <span className={`text-sm font-medium ${color}`}>
      {overdue ? '-' : ''}{Math.abs(hours)}h
    </span>
  );
}

function QADots({ passed, total, onClick }: { passed: number; total: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-0.5 cursor-pointer" title={`${passed}/${total} QA checks`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < passed ? 'bg-emerald-400' : 'bg-gray-600'
          }`}
        />
      ))}
    </button>
  );
}

export default function DeliverablesTable({ deliverables, onSelect, onQAClick }: DeliverablesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e2a3a] text-[10px] uppercase tracking-wider text-gray-500">
            <th className="p-3 text-left w-8">
              <input type="checkbox" className="rounded bg-[#1a2332] border-gray-600" />
            </th>
            <th className="p-3 text-left">Deliverable</th>
            <th className="p-3 text-left">Client</th>
            <th className="p-3 text-left">Priority</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">SLA</th>
            <th className="p-3 text-left">Assignee</th>
            <th className="p-3 text-left">QA</th>
            <th className="p-3 text-left">Portal</th>
            <th className="p-3 text-left">VA / VF</th>
            <th className="p-3 text-left w-10"></th>
          </tr>
        </thead>
        <tbody>
          {deliverables.map((d) => (
            <tr
              key={d.id}
              className={`border-b border-[#1e2a3a] hover:bg-[#1a2332] transition-colors ${
                d.slaOverdue ? 'bg-red-950/20' : ''
              }`}
            >
              {/* Checkbox */}
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={d.selected || false}
                  onChange={() => onSelect(d.id)}
                  className="rounded bg-[#1a2332] border-gray-600 cursor-pointer"
                />
              </td>

              {/* Deliverable + type badge */}
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{d.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[d.type] || 'bg-gray-700 text-gray-400'}`}>
                    {d.type}
                  </span>
                </div>
              </td>

              {/* Client */}
              <td className="p-3 text-gray-400">{d.client}</td>

              {/* Priority badge */}
              <td className="p-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_BADGE_COLORS[d.priority]}`}>
                  {d.priority}
                </span>
              </td>

              {/* Status pill */}
              <td className="p-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#1a2332] text-gray-300 border border-[#1e2a3a]">
                  {d.status}
                </span>
              </td>

              {/* SLA colored */}
              <td className="p-3">
                <SLACell hours={d.slaHours} overdue={d.slaOverdue} />
              </td>

              {/* Assignee avatar */}
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center text-[10px] font-semibold">
                    {d.assignee.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="text-gray-400 text-xs">{d.assignee.name}</span>
                </div>
              </td>

              {/* QA dots */}
              <td className="p-3">
                <QADots passed={d.qaChecks.passed} total={d.qaChecks.total} onClick={() => onQAClick(d)} />
              </td>

              {/* Portal dot */}
              <td className="p-3">
                {d.portalPublished ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <Circle size={16} className="text-gray-600" />
                )}
              </td>

              {/* VA/VF badges */}
              <td className="p-3">
                <div className="flex items-center gap-1">
                  {d.vaScore !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400">
                      VA {d.vaScore}
                    </span>
                  )}
                  {d.vfScore !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-400">
                      VF {d.vfScore}
                    </span>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="p-3">
                <button className="text-gray-500 hover:text-white cursor-pointer">
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
