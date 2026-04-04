'use client';

import { X, Download, Send, RefreshCw } from 'lucide-react';

interface Revision {
  version: string;
  author: string;
  date: string;
  notes: string;
}

interface QACheck {
  label: string;
  passed: boolean;
}

interface DeliverableDetail {
  id: string;
  name: string;
  type: 'Scorecard' | 'Report' | 'Audit' | 'IR Plan' | 'Training' | 'Assessment';
  client: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  slaHours: number;
  slaOverdue: boolean;
  assignee: { name: string; avatar?: string };
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  revisions: Revision[];
  qaChecks: QACheck[];
  portalPublished: boolean;
  portalUrl?: string;
}

interface DeliverableDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: DeliverableDetail | null;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  Scorecard: 'bg-emerald-900/50 text-emerald-400',
  Report: 'bg-blue-900/50 text-blue-400',
  Audit: 'bg-purple-900/50 text-purple-400',
  'IR Plan': 'bg-amber-900/50 text-amber-400',
  Training: 'bg-yellow-900/50 text-yellow-400',
  Assessment: 'bg-red-900/50 text-red-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'text-red-400',
  High: 'text-orange-400',
  Medium: 'text-amber-400',
  Low: 'text-gray-400',
};

export default function DeliverableDetailDrawer({ isOpen, onClose, deliverable }: DeliverableDetailDrawerProps) {
  if (!deliverable) return null;

  const d = deliverable;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-[600px] bg-[#111827] border-l border-[#1e2a3a] z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-[#1e2a3a]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-white">{d.name}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[d.type] || 'bg-gray-700 text-gray-400'}`}>
                {d.type}
              </span>
            </div>
            <p className="text-xs text-gray-500">{d.client}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Detail sections */}
        <div className="p-5 space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Status</p>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#1a2332] text-gray-300 border border-[#1e2a3a]">
                {d.status}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Priority</p>
              <span className={`text-sm font-medium ${PRIORITY_COLORS[d.priority]}`}>
                {d.priority}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">SLA</p>
              <span className={`text-sm font-medium ${d.slaOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
                {d.slaOverdue ? '-' : ''}{Math.abs(d.slaHours)}h {d.slaOverdue ? 'overdue' : 'remaining'}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Assignee</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center text-[10px] font-semibold">
                  {d.assignee.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className="text-sm text-gray-300">{d.assignee.name}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {d.description && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Description</p>
              <p className="text-sm text-gray-400 leading-relaxed">{d.description}</p>
            </div>
          )}

          {/* Revision History */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">Revision History</p>
            <div className="space-y-2">
              {d.revisions.map((rev, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-[#0d1117] border border-[#1e2a3a] rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {rev.version}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{rev.author}</span>
                      <span className="text-[10px] text-gray-600">{rev.date}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{rev.notes}</p>
                  </div>
                </div>
              ))}

              {d.revisions.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-3">No revisions yet</p>
              )}
            </div>
          </div>

          {/* QA Checks */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">QA Checks</p>
            <div className="space-y-1">
              {d.qaChecks.map((check, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2.5 rounded-lg ${
                    check.passed ? 'bg-emerald-900/10' : 'bg-[#0d1117]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${check.passed ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                  <span className={`text-sm ${check.passed ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Portal Status */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Portal</p>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${d.portalPublished ? 'bg-emerald-400' : 'bg-gray-600'}`} />
              <span className={`text-sm ${d.portalPublished ? 'text-emerald-400' : 'text-gray-400'}`}>
                {d.portalPublished ? 'Published' : 'Not published'}
              </span>
              {d.portalUrl && (
                <a
                  href={d.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#C9A84C] hover:underline ml-2"
                >
                  View portal
                </a>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-[10px] text-gray-600 pt-2 border-t border-[#1e2a3a]">
            {d.createdAt && <span>Created: {d.createdAt}</span>}
            {d.updatedAt && <span>Updated: {d.updatedAt}</span>}
          </div>
        </div>

        {/* Action footer */}
        <div className="sticky bottom-0 bg-[#111827] border-t border-[#1e2a3a] p-4 flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a2332] text-gray-300 hover:text-white text-sm border border-[#1e2a3a] cursor-pointer">
            <Download size={14} />
            Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a2332] text-gray-300 hover:text-white text-sm border border-[#1e2a3a] cursor-pointer">
            <RefreshCw size={14} />
            Request Revision
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#C9A84C] text-black hover:bg-[#d4b65e] text-sm font-semibold ml-auto cursor-pointer">
            <Send size={14} />
            Publish to Portal
          </button>
        </div>
      </div>
    </>
  );
}
