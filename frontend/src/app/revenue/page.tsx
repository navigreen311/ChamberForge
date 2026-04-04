'use client';

import { useState, useMemo } from 'react';

/* ─── INLINE DATA ─────────────────────────────────────────────────── */

const KPI = [
  { label: 'Current MRR', value: '$75K', sub: 'Monthly recurring', color: 'text-emerald-400' },
  { label: 'MRR Growth', value: '+12%', sub: 'Month-over-month', color: 'text-emerald-400' },
  { label: 'Pipeline ARR', value: '$1.6M', sub: 'Annual run-rate', color: 'text-sky-400' },
  { label: 'Total LTV', value: '$2.1M', sub: 'Lifetime value', color: 'text-violet-400' },
  { label: 'Avg Retainer', value: '$18.5K', sub: 'Per client/mo', color: 'text-sky-400' },
  { label: 'Churn Risk', value: '$18K', sub: '2 clients flagged', color: 'text-amber-400' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MRR_DATA = [32,35,38,41,44,48,52,57,61,66,70,75]; // in $K

const MRR_CLIENTS: { name: string; color: string; data: number[] }[] = [
  { name: 'TechVentures', color: '#34d399', data: [12,13,14,15,15,16,17,18,19,20,21,22] },
  { name: 'NovaCorp',     color: '#38bdf8', data: [8,9,9,10,11,12,13,14,15,16,17,18] },
  { name: 'Meridian',     color: '#a78bfa', data: [6,6,7,7,8,9,10,11,12,13,14,15] },
  { name: 'Atlas Group',  color: '#fb923c', data: [4,4,5,5,6,6,7,8,9,10,11,12] },
  { name: 'Others',       color: '#64748b', data: [2,3,3,4,4,5,5,6,6,7,7,8] },
];

const WATERFALL = [
  { label: 'Current MRR', value: 75, type: 'base' as const },
  { label: 'New (Drafts)', value: 30, type: 'add' as const },
  { label: 'Churn Risk', value: -18, type: 'sub' as const },
  { label: 'Renewals', value: 0, type: 'neutral' as const },
  { label: 'Projected', value: 87, type: 'total' as const },
];

const RENEWALS = [
  { client: 'Atlas Group', offer: 'Growth Accelerator', date: '2026-04-18', monthly: 12000, daysLeft: 15, probability: 72 },
  { client: 'NovaCorp', offer: 'Market Intelligence Suite', date: '2026-04-28', monthly: 18000, daysLeft: 25, probability: 88 },
  { client: 'Meridian', offer: 'Brand Strategy Retainer', date: '2026-05-12', monthly: 15000, daysLeft: 39, probability: 91 },
  { client: 'SummitEdge', offer: 'Performance Marketing', date: '2026-06-01', monthly: 9500, daysLeft: 59, probability: 65 },
  { client: 'TechVentures', offer: 'Full-Stack Advisory', date: '2026-07-15', monthly: 22000, daysLeft: 103, probability: 95 },
];

const EXPANSIONS = [
  { client: 'NovaCorp', current: 'Market Intelligence Suite', suggested: 'AI-Powered Competitive Dashboard', addMRR: 8500, trigger: 'Client requested real-time competitor tracking in last QBR' },
  { client: 'TechVentures', current: 'Full-Stack Advisory', suggested: 'Executive Coaching Add-on', addMRR: 6000, trigger: 'New CTO hire — onboarding alignment opportunity' },
  { client: 'Meridian', current: 'Brand Strategy Retainer', suggested: 'Content Engine Expansion', addMRR: 4500, trigger: 'Engagement metrics up 34%; capacity for scale' },
];

const MARGINS = [
  { client: 'TechVentures', retainer: 22000, deliveryCost: 11200, margin: 49.1, trend: 'up' as const },
  { client: 'NovaCorp', retainer: 18000, deliveryCost: 7800, margin: 56.7, trend: 'up' as const },
  { client: 'Meridian', retainer: 15000, deliveryCost: 9600, margin: 36.0, trend: 'down' as const },
  { client: 'Atlas Group', retainer: 12000, deliveryCost: 8400, margin: 30.0, trend: 'down' as const },
];

const MARGIN_THRESHOLD = 40;

/* ─── HELPERS ─────────────────────────────────────────────────────── */

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}

/* ─── COMPONENTS ──────────────────────────────────────────────────── */

function KpiRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {KPI.map((k) => (
        <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</p>
          <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          <p className="text-xs text-zinc-500 mt-1">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

function MrrChart() {
  const W = 720, H = 260, PX = 48, PY = 24, PB = 32;
  const cw = W - PX * 2, ch = H - PY - PB;
  const max = 80;
  const x = (i: number) => PX + (i / 11) * cw;
  const y = (v: number) => PY + ch - (v / max) * ch;

  // Build stacked areas bottom-up
  const stacked = MRR_CLIENTS.map((_, ci) => {
    return MONTHS.map((_, mi) => {
      let sum = 0;
      for (let k = 0; k <= ci; k++) sum += MRR_CLIENTS[k].data[mi];
      return sum;
    });
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-200">MRR Over Time</h2>
        <div className="flex gap-3 flex-wrap">
          {MRR_CLIENTS.map((c) => (
            <span key={c.name} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
              {c.name}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 20, 40, 60, 80].map((v) => (
          <g key={v}>
            <line x1={PX} x2={W - PX} y1={y(v)} y2={y(v)} stroke="#27272a" strokeWidth={1} />
            <text x={PX - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-600 text-[10px]">${v}K</text>
          </g>
        ))}
        {/* Stacked areas */}
        {stacked.map((vals, ci) => {
          const below = ci > 0 ? stacked[ci - 1] : MONTHS.map(() => 0);
          const pathD =
            vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ') +
            [...below].reverse().map((v, i) => `L${x(11 - i)},${y(v)}`).join(' ') + ' Z';
          return <path key={ci} d={pathD} fill={MRR_CLIENTS[ci].color} fillOpacity={0.25} stroke={MRR_CLIENTS[ci].color} strokeWidth={1.5} />;
        })}
        {/* Top line */}
        <polyline
          points={MRR_DATA.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
          fill="none" stroke="#34d399" strokeWidth={2}
        />
        {MRR_DATA.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#34d399" />
        ))}
        {/* X labels */}
        {MONTHS.map((m, i) => (
          <text key={m} x={x(i)} y={H - 6} textAnchor="middle" className="fill-zinc-500 text-[10px]">{m}</text>
        ))}
      </svg>
    </div>
  );
}

function PipelineWaterfall() {
  const W = 600, H = 240, PX = 56, PY = 20, PB = 36;
  const barW = 60, gap = 24;
  const max = 110;
  const yScale = (v: number) => PY + (H - PY - PB) - (v / max) * (H - PY - PB);

  let running = 0;
  const bars = WATERFALL.map((w) => {
    let yTop: number, yBot: number, color: string;
    if (w.type === 'base' || w.type === 'total') {
      yTop = yScale(w.value);
      yBot = yScale(0);
      color = w.type === 'total' ? '#34d399' : '#38bdf8';
      running = w.value;
    } else if (w.type === 'add') {
      const prev = running;
      running += w.value;
      yTop = yScale(running);
      yBot = yScale(prev);
      color = '#34d399';
    } else if (w.type === 'sub') {
      const prev = running;
      running += w.value; // negative
      yTop = yScale(prev);
      yBot = yScale(running);
      color = '#f87171';
    } else {
      yTop = yScale(running);
      yBot = yScale(running);
      color = '#64748b';
    }
    return { ...w, yTop, yBot, color, running };
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-zinc-200 mb-3">Pipeline Forecast (Waterfall)</h2>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={PX} x2={W - 10} y1={yScale(v)} y2={yScale(v)} stroke="#27272a" strokeWidth={1} />
            <text x={PX - 6} y={yScale(v) + 4} textAnchor="end" className="fill-zinc-600 text-[10px]">${v}K</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const bx = PX + i * (barW + gap);
          const height = Math.abs(b.yBot - b.yTop);
          return (
            <g key={i}>
              <rect x={bx} y={b.yTop} width={barW} height={Math.max(height, 1)} rx={4} fill={b.color} fillOpacity={0.7} />
              <text x={bx + barW / 2} y={b.yTop - 6} textAnchor="middle" className="fill-zinc-300 text-[11px] font-semibold">
                {b.value < 0 ? `-$${Math.abs(b.value)}K` : `$${b.value}K`}
              </text>
              <text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="fill-zinc-500 text-[9px]">{b.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function RenewalSchedule() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 overflow-x-auto">
      <h2 className="text-sm font-semibold text-zinc-200 mb-3">Renewal Schedule</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
            <th className="text-left py-2 pr-4">Client</th>
            <th className="text-left py-2 pr-4">Offer</th>
            <th className="text-left py-2 pr-4">Date</th>
            <th className="text-right py-2 pr-4">Monthly</th>
            <th className="text-right py-2 pr-4">Days Left</th>
            <th className="text-right py-2 pr-4">Probability</th>
            <th className="text-right py-2" />
          </tr>
        </thead>
        <tbody>
          {RENEWALS.map((r) => {
            const amber = r.daysLeft <= 30;
            return (
              <tr key={r.client} className={`border-b border-zinc-800/50 ${amber ? 'bg-amber-950/20' : ''}`}>
                <td className="py-2.5 pr-4 font-medium text-zinc-200">{r.client}</td>
                <td className="py-2.5 pr-4 text-zinc-400">{r.offer}</td>
                <td className="py-2.5 pr-4 text-zinc-400">{r.date}</td>
                <td className="py-2.5 pr-4 text-right text-zinc-300">{fmt(r.monthly)}</td>
                <td className={`py-2.5 pr-4 text-right font-semibold ${amber ? 'text-amber-400' : 'text-zinc-300'}`}>
                  {r.daysLeft}d
                </td>
                <td className="py-2.5 pr-4 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    r.probability >= 85 ? 'bg-emerald-900/40 text-emerald-400' :
                    r.probability >= 70 ? 'bg-sky-900/40 text-sky-400' :
                    'bg-amber-900/40 text-amber-400'
                  }`}>{r.probability}%</span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="px-3 py-1 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
                    Prepare renewal
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

function ExpansionOpportunities() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-zinc-200">Expansion Opportunities</h2>
        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-violet-900/40 text-violet-400 uppercase tracking-wider">AI-Identified</span>
      </div>
      <div className="space-y-3">
        {EXPANSIONS.map((e) => (
          <div key={e.client} className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-zinc-200">{e.client}</span>
                  <span className="text-xs text-zinc-600">|</span>
                  <span className="text-xs text-zinc-500">{e.current}</span>
                </div>
                <p className="text-sm text-sky-400 font-medium">{e.suggested}</p>
                <p className="text-xs text-zinc-500 mt-1">{e.trigger}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-emerald-400">+{fmt(e.addMRR)}</p>
                <p className="text-[10px] text-zinc-500 uppercase">Add. MRR</p>
                <button className="mt-2 px-3 py-1 text-xs font-medium rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors border border-violet-600/30">
                  Build expansion offer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarginAnalysis() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 overflow-x-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-200">Margin Analysis</h2>
        <span className="text-xs text-zinc-500">Threshold: {MARGIN_THRESHOLD}% gross margin</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800">
            <th className="text-left py-2 pr-4">Client</th>
            <th className="text-right py-2 pr-4">Retainer</th>
            <th className="text-right py-2 pr-4">Delivery Cost</th>
            <th className="text-right py-2 pr-4">Gross Margin</th>
            <th className="text-right py-2">Trend</th>
          </tr>
        </thead>
        <tbody>
          {MARGINS.map((m) => {
            const below = m.margin < MARGIN_THRESHOLD;
            return (
              <tr key={m.client} className={`border-b border-zinc-800/50 ${below ? 'bg-red-950/15' : ''}`}>
                <td className="py-2.5 pr-4 font-medium text-zinc-200">{m.client}</td>
                <td className="py-2.5 pr-4 text-right text-zinc-300">{fmt(m.retainer)}</td>
                <td className="py-2.5 pr-4 text-right text-zinc-400">{fmt(m.deliveryCost)}</td>
                <td className={`py-2.5 pr-4 text-right font-semibold ${below ? 'text-red-400' : 'text-emerald-400'}`}>
                  {m.margin.toFixed(1)}%
                </td>
                <td className="py-2.5 text-right">
                  {m.trend === 'up' ? (
                    <span className="text-emerald-400 text-base">&#9650;</span>
                  ) : (
                    <span className="text-red-400 text-base">&#9660;</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ScenarioPlanner() {
  const [newClients, setNewClients] = useState(4);
  const [avgRetainer, setAvgRetainer] = useState(18);
  const [churnRate, setChurnRate] = useState(5);

  const projectedARR = useMemo(() => {
    const currentARR = 75 * 12;
    const newRevenue = newClients * avgRetainer * 12;
    const churnLoss = currentARR * (churnRate / 100);
    return currentARR + newRevenue - churnLoss;
  }, [newClients, avgRetainer, churnRate]);

  const sliders: { label: string; value: number; setValue: (v: number) => void; min: number; max: number; step: number; unit: string }[] = [
    { label: 'New Clients / Quarter', value: newClients, setValue: setNewClients, min: 0, max: 12, step: 1, unit: '' },
    { label: 'Avg Retainer ($K/mo)', value: avgRetainer, setValue: setAvgRetainer, min: 5, max: 40, step: 1, unit: 'K' },
    { label: 'Annual Churn Rate (%)', value: churnRate, setValue: setChurnRate, min: 0, max: 25, step: 1, unit: '%' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-zinc-200 mb-4">Scenario Planner</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-zinc-400">{s.label}</label>
              <span className="text-sm font-semibold text-zinc-200">
                {s.unit === 'K' ? `$${s.value}K` : s.unit === '%' ? `${s.value}%` : s.value}
              </span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.setValue(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-zinc-600">{s.unit === 'K' ? `$${s.min}K` : s.unit === '%' ? `${s.min}%` : s.min}</span>
              <span className="text-[10px] text-zinc-600">{s.unit === 'K' ? `$${s.max}K` : s.unit === '%' ? `${s.max}%` : s.max}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Projected Annual Revenue</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{fmt(projectedARR * 1000)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">vs. Current ARR ($900K)</p>
          <p className={`text-lg font-semibold ${projectedARR > 900 ? 'text-emerald-400' : 'text-red-400'}`}>
            {projectedARR > 900 ? '+' : ''}{fmt((projectedARR - 900) * 1000)} ({((projectedARR - 900) / 900 * 100).toFixed(1)}%)
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ────────────────────────────────────────────────────────── */

export default function RevenuePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revenue &amp; Forecast</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Financial health, pipeline projections, and scenario modeling</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <KpiRow />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <MrrChart />
        <PipelineWaterfall />
      </div>

      {/* Renewal Schedule */}
      <RenewalSchedule />

      {/* Expansion + Margin Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ExpansionOpportunities />
        <MarginAnalysis />
      </div>

      {/* Scenario Planner */}
      <ScenarioPlanner />
    </div>
  );
}
