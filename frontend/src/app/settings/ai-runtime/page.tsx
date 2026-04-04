'use client';

import { useState } from 'react';
import { ArrowLeft, Bot, AlertTriangle, DollarSign, Clock, Database, Activity, ChevronDown } from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Inline Data                                                        */
/* ------------------------------------------------------------------ */

const MODELS = ['GPT-4o', 'GPT-4o-mini', 'Claude 3.5 Sonnet', 'Claude 3 Haiku', 'Gemini 1.5 Pro', 'Llama 3.1 70B'];

interface Agent {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  requestsToday: number;
  avgLatency: number;
  costToday: number;
  cacheHit: number;
  lastError: string;
  model: string;
  budgetLimit: number;
}

const AGENTS: Agent[] = [
  { name: 'Command',      status: 'online',   requestsToday: 412, avgLatency: 280, costToday: 18.40, cacheHit: 82, lastError: '—',                       model: 'GPT-4o',             budgetLimit: 25 },
  { name: 'Research',     status: 'online',   requestsToday: 387, avgLatency: 350, costToday: 16.20, cacheHit: 76, lastError: '—',                       model: 'Claude 3.5 Sonnet',  budgetLimit: 22 },
  { name: 'Problem',      status: 'online',   requestsToday: 298, avgLatency: 310, costToday: 14.80, cacheHit: 80, lastError: '—',                       model: 'GPT-4o',             budgetLimit: 20 },
  { name: 'Offer',        status: 'degraded', requestsToday: 256, avgLatency: 520, costToday: 12.50, cacheHit: 68, lastError: 'Timeout at 14:32 UTC',    model: 'GPT-4o-mini',        budgetLimit: 18 },
  { name: 'Pricing',      status: 'online',   requestsToday: 189, avgLatency: 290, costToday: 11.00, cacheHit: 85, lastError: '—',                       model: 'Claude 3 Haiku',     budgetLimit: 15 },
  { name: 'Validator',    status: 'online',   requestsToday: 345, avgLatency: 260, costToday: 13.60, cacheHit: 88, lastError: '—',                       model: 'Claude 3 Haiku',     budgetLimit: 18 },
  { name: 'Copy',         status: 'online',   requestsToday: 278, avgLatency: 400, costToday: 15.90, cacheHit: 72, lastError: '—',                       model: 'Claude 3.5 Sonnet',  budgetLimit: 20 },
  { name: 'Relationship', status: 'offline',  requestsToday: 0,   avgLatency: 0,   costToday: 0,     cacheHit: 0,  lastError: 'Connection refused 09:15', model: 'GPT-4o',             budgetLimit: 20 },
  { name: 'Proof',        status: 'online',   requestsToday: 201, avgLatency: 320, costToday: 10.30, cacheHit: 79, lastError: '—',                       model: 'Gemini 1.5 Pro',     budgetLimit: 15 },
  { name: 'Fulfillment',  status: 'degraded', requestsToday: 164, avgLatency: 480, costToday: 9.10,  cacheHit: 65, lastError: 'Rate limit at 12:04 UTC', model: 'GPT-4o-mini',        budgetLimit: 15 },
];

const WEEKLY_COSTS = [
  { day: 'Mon', cost: 18.4 },
  { day: 'Tue', cost: 22.1 },
  { day: 'Wed', cost: 19.8 },
  { day: 'Thu', cost: 25.3 },
  { day: 'Fri', cost: 21.6 },
  { day: 'Sat', cost: 16.9 },
  { day: 'Sun', cost: 17.9 },
];

const KPI = [
  { label: 'Total Cost',    value: '$142/mo',  icon: DollarSign, color: 'text-green-400' },
  { label: 'Avg Latency',   value: '340 ms',   icon: Clock,      color: 'text-blue-400' },
  { label: 'Cache Hit',     value: '78%',       icon: Database,   color: 'text-purple-400' },
  { label: 'Active Agents', value: '8 / 10',    icon: Bot,        color: 'text-amber-400' },
  { label: 'Failed Today',  value: '3',         icon: AlertTriangle, color: 'text-red-400' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function statusDot(s: Agent['status']) {
  const cls =
    s === 'online' ? 'bg-green-400' : s === 'degraded' ? 'bg-yellow-400' : 'bg-red-400';
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${cls}`} />;
}

function CostChart() {
  const max = Math.max(...WEEKLY_COSTS.map((d) => d.cost));
  const barH = 120;
  return (
    <svg viewBox={`0 0 ${WEEKLY_COSTS.length * 52} ${barH + 30}`} className="w-full h-40">
      {WEEKLY_COSTS.map((d, i) => {
        const h = (d.cost / max) * barH;
        const x = i * 52 + 10;
        return (
          <g key={d.day}>
            <rect x={x} y={barH - h} width={32} height={h} rx={4} className="fill-amber-500/80" />
            <text x={x + 16} y={barH - h - 6} textAnchor="middle" className="fill-zinc-400 text-[10px]">
              ${d.cost.toFixed(0)}
            </text>
            <text x={x + 16} y={barH + 16} textAnchor="middle" className="fill-zinc-500 text-[11px]">
              {d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AIRuntimePage() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const updateAgent = (idx: number, patch: Partial<Agent>) =>
    setAgents((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/70 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-6 py-4">
          <Link href="/settings" className="text-zinc-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AI Runtime Governance</h1>
            <p className="text-sm text-zinc-500">Monitor, budget, and route your AI agent fleet</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* KPI Row */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {KPI.map((k) => (
            <div key={k.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <k.icon size={16} className={k.color} />
                <span className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</span>
              </div>
              <span className="text-2xl font-bold">{k.value}</span>
            </div>
          ))}
        </section>

        {/* 7-day Cost Chart */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">7-Day Cost Trend</h2>
          <CostChart />
        </section>

        {/* Agent Table */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-400">Per-Agent Performance</h2>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-[1fr_100px_100px_100px_100px_100px_1fr] gap-2 px-6 py-2 text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800/60">
            <span>Agent</span>
            <span className="text-right">Requests</span>
            <span className="text-right">Latency</span>
            <span className="text-right">Cost</span>
            <span className="text-right">Cache</span>
            <span className="text-right">Status</span>
            <span>Last Error</span>
          </div>

          {agents.map((agent, idx) => (
            <div key={agent.name} className="border-b border-zinc-800/40 last:border-0">
              {/* Row */}
              <button
                onClick={() => setExpandedAgent(expandedAgent === agent.name ? null : agent.name)}
                className="w-full grid grid-cols-2 lg:grid-cols-[1fr_100px_100px_100px_100px_100px_1fr] gap-2 px-6 py-3 text-sm hover:bg-zinc-800/40 transition text-left items-center"
              >
                <span className="flex items-center gap-2 font-medium">
                  {statusDot(agent.status)}
                  {agent.name}
                  <ChevronDown
                    size={14}
                    className={`text-zinc-600 transition-transform ${expandedAgent === agent.name ? 'rotate-180' : ''}`}
                  />
                </span>
                <span className="text-right text-zinc-300">{agent.requestsToday.toLocaleString()}</span>
                <span className="text-right text-zinc-300 hidden lg:block">{agent.avgLatency ? `${agent.avgLatency} ms` : '—'}</span>
                <span className="text-right text-zinc-300 hidden lg:block">{agent.costToday ? `$${agent.costToday.toFixed(2)}` : '—'}</span>
                <span className="text-right text-zinc-300 hidden lg:block">{agent.cacheHit ? `${agent.cacheHit}%` : '—'}</span>
                <span className="text-right hidden lg:block">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      agent.status === 'online'
                        ? 'bg-green-500/10 text-green-400'
                        : agent.status === 'degraded'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                </span>
                <span className="text-zinc-500 text-xs truncate hidden lg:block">{agent.lastError}</span>
              </button>

              {/* Expanded Controls */}
              {expandedAgent === agent.name && (
                <div className="bg-zinc-800/30 px-6 py-5 grid sm:grid-cols-2 gap-6 border-t border-zinc-800/60">
                  {/* Budget Slider */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 block">
                      Daily Budget Limit{' '}
                      <span className="text-amber-400 font-semibold">${agent.budgetLimit}</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={agent.budgetLimit}
                      onChange={(e) => updateAgent(idx, { budgetLimit: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600">
                      <span>$0</span>
                      <span>$50</span>
                    </div>
                  </div>

                  {/* Model Routing */}
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 block">Model Routing</label>
                    <select
                      value={agent.model}
                      onChange={(e) => updateAgent(idx, { model: e.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      {MODELS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition">
            Save Runtime Config
          </button>
        </div>
      </main>
    </div>
  );
}
