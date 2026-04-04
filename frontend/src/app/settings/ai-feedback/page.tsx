'use client';

import { useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, Brain, AlertTriangle, BarChart3, Filter } from 'lucide-react';
import Link from 'next/link';

interface AgentFeedback {
  name: string;
  thumbsUp: number;
  thumbsDown: number;
  total: number;
  positiveRate: number;
  topRejection: string;
  trend: 'improving' | 'declining';
}

const AGENTS: AgentFeedback[] = [
  { name: 'Problem Analyst', thumbsUp: 72, thumbsDown: 18, total: 90, positiveRate: 80, topRejection: 'Not relevant', trend: 'improving' },
  { name: 'Copy AI', thumbsUp: 55, thumbsDown: 40, total: 95, positiveRate: 58, topRejection: 'Inaccurate', trend: 'declining' },
  { name: 'Compliance Checker', thumbsUp: 68, thumbsDown: 12, total: 80, positiveRate: 85, topRejection: 'Other', trend: 'improving' },
  { name: 'Offer Builder', thumbsUp: 82, thumbsDown: 10, total: 92, positiveRate: 89, topRejection: 'Not relevant', trend: 'improving' },
  { name: 'Client Researcher', thumbsUp: 60, thumbsDown: 25, total: 85, positiveRate: 71, topRejection: 'Inaccurate', trend: 'improving' },
  { name: 'Risk Scorer', thumbsUp: 74, thumbsDown: 14, total: 88, positiveRate: 84, topRejection: 'Compliance risk', trend: 'improving' },
  { name: 'Playbook Generator', thumbsUp: 65, thumbsDown: 22, total: 87, positiveRate: 75, topRejection: 'Not relevant', trend: 'declining' },
  { name: 'Delivery Planner', thumbsUp: 70, thumbsDown: 16, total: 86, positiveRate: 81, topRejection: 'Other', trend: 'improving' },
  { name: 'Report Writer', thumbsUp: 58, thumbsDown: 20, total: 78, positiveRate: 74, topRejection: 'Inaccurate', trend: 'declining' },
  { name: 'Lifecycle Advisor', thumbsUp: 57, thumbsDown: 9, total: 66, positiveRate: 86, topRejection: 'Not relevant', trend: 'improving' },
];

const OVERALL = {
  totalFeedback: 847,
  positiveRate: 78,
  mostFlagged: 'Copy AI',
  improvingCount: 7,
  totalAgents: 10,
};

const REJECTION_BREAKDOWN = [
  { reason: 'Inaccurate', count: 62, pct: 33 },
  { reason: 'Not relevant', count: 55, pct: 29 },
  { reason: 'Compliance risk', count: 38, pct: 20 },
  { reason: 'Other', count: 33, pct: 18 },
];

export default function AIFeedbackStatsPage() {
  const [sortBy, setSortBy] = useState<'name' | 'positiveRate' | 'total'>('positiveRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...AGENTS].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'name') return mul * a.name.localeCompare(b.name);
    return mul * (a[sortBy] - b[sortBy]);
  });

  const toggleSort = (col: 'name' | 'positiveRate' | 'total') => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">AI Feedback Dashboard</h1>
        <p className="text-chamber-400">Aggregate feedback across all AI agents. Track quality and improvement trends.</p>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-chamber-800 bg-chamber-900 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/20">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm text-chamber-400">Total Feedback</span>
          </div>
          <p className="text-3xl font-bold text-white">{OVERALL.totalFeedback}</p>
        </div>

        <div className="rounded-xl border border-chamber-800 bg-chamber-900 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-400/20">
              <ThumbsUp className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm text-chamber-400">Positive Rate</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{OVERALL.positiveRate}%</p>
        </div>

        <div className="rounded-xl border border-chamber-800 bg-chamber-900 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-400/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-sm text-chamber-400">Most Flagged Agent</span>
          </div>
          <p className="text-xl font-bold text-red-400">{OVERALL.mostFlagged}</p>
        </div>

        <div className="rounded-xl border border-chamber-800 bg-chamber-900 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/20">
              <TrendingUp className="h-5 w-5 text-gold-400" />
            </div>
            <span className="text-sm text-chamber-400">Improving Agents</span>
          </div>
          <p className="text-3xl font-bold text-gold-400">{OVERALL.improvingCount}/{OVERALL.totalAgents}</p>
        </div>
      </div>

      {/* Rejection Breakdown */}
      <div className="rounded-xl border border-chamber-800 bg-chamber-900 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Rejection Reasons Breakdown</h2>
        <div className="space-y-3">
          {REJECTION_BREAKDOWN.map((item) => (
            <div key={item.reason} className="flex items-center gap-4">
              <span className="w-32 text-sm text-chamber-300 shrink-0">{item.reason}</span>
              <div className="flex-1 h-6 rounded-full bg-chamber-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-400/80 to-gold-400 transition-all"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="text-sm text-chamber-400 w-16 text-right">{item.count} ({item.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Agent Table */}
      <div className="rounded-xl border border-chamber-800 bg-chamber-900 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-chamber-800">
          <h2 className="text-lg font-semibold text-white">Per-Agent Performance</h2>
          <div className="flex items-center gap-2 text-chamber-400">
            <Filter className="h-4 w-4" />
            <span className="text-xs">Click headers to sort</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-chamber-800 text-chamber-400">
                <th
                  onClick={() => toggleSort('name')}
                  className="text-left px-6 py-3 font-medium cursor-pointer hover:text-white transition"
                >
                  Agent {sortBy === 'name' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <ThumbsUp className="h-4 w-4 inline text-green-400" /> %
                </th>
                <th className="text-center px-4 py-3 font-medium">
                  <ThumbsDown className="h-4 w-4 inline text-red-400" /> %
                </th>
                <th
                  onClick={() => toggleSort('total')}
                  className="text-center px-4 py-3 font-medium cursor-pointer hover:text-white transition"
                >
                  Total {sortBy === 'total' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                </th>
                <th className="text-left px-4 py-3 font-medium">Top Rejection</th>
                <th
                  onClick={() => toggleSort('positiveRate')}
                  className="text-center px-4 py-3 font-medium cursor-pointer hover:text-white transition"
                >
                  Trend {sortBy === 'positiveRate' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((agent) => (
                <tr key={agent.name} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-gold-400" />
                      <span className="text-white font-medium">{agent.name}</span>
                    </div>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-medium ${agent.positiveRate >= 75 ? 'text-green-400' : agent.positiveRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {agent.positiveRate}%
                    </span>
                  </td>
                  <td className="text-center px-4 py-3 text-red-400">
                    {100 - agent.positiveRate}%
                  </td>
                  <td className="text-center px-4 py-3 text-chamber-300">{agent.total}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full border border-chamber-700 bg-chamber-800 px-2.5 py-0.5 text-xs text-chamber-300">
                      {agent.topRejection}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3">
                    {agent.trend === 'improving' ? (
                      <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                        <TrendingUp className="h-3.5 w-3.5" /> Improving
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
                        <TrendingDown className="h-3.5 w-3.5" /> Declining
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
