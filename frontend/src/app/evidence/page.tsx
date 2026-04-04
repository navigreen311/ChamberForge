'use client';

import { useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  INLINE DATA                                                        */
/* ------------------------------------------------------------------ */

interface Source {
  id: string;
  name: string;
  status: 'active' | 'stale' | 'error';
  claimCount: number;
  credibility: number;
  lastIngested: string;
}

interface Claim {
  id: string;
  text: string;
  sourceId: string;
  type: 'reg' | 'peer' | 'ind';
  credibility: number;
  date: string;
  recency: 'fresh' | 'aging' | 'stale';
  problems: string[];
  contradiction: string | null; // id of conflicting claim
}

const SOURCES: Source[] = [
  { id: 's1', name: 'UBS Report', status: 'active', claimCount: 187, credibility: 8.4, lastIngested: '2026-03-28' },
  { id: 's2', name: 'FBI Alerts', status: 'active', claimCount: 94, credibility: 9.1, lastIngested: '2026-03-30' },
  { id: 's3', name: 'Deloitte', status: 'stale', claimCount: 211, credibility: 7.9, lastIngested: '2025-11-14' },
  { id: 's4', name: 'Citi', status: 'active', claimCount: 156, credibility: 7.6, lastIngested: '2026-03-25' },
  { id: 's5', name: 'PubMed', status: 'active', claimCount: 102, credibility: 8.8, lastIngested: '2026-03-29' },
  { id: 's6', name: 'Capgemini', status: 'active', claimCount: 143, credibility: 7.2, lastIngested: '2026-03-20' },
  { id: 's7', name: 'IC3', status: 'error', claimCount: 78, credibility: 8.5, lastIngested: '2026-02-10' },
  { id: 's8', name: 'McKinsey', status: 'stale', claimCount: 164, credibility: 7.5, lastIngested: '2025-12-02' },
  { id: 's9', name: 'FTC', status: 'active', claimCount: 112, credibility: 8.0, lastIngested: '2026-03-31' },
];

const CLAIMS: Claim[] = [
  { id: 'c1', text: 'Ultra-high-net-worth clients face 34% higher fraud targeting rates compared to standard wealth segments, driven by social engineering vectors.', sourceId: 's1', type: 'ind', credibility: 8.2, date: '2026-03-28', recency: 'fresh', problems: ['Fraud Risk', 'Client Segmentation'], contradiction: 'c4' },
  { id: 'c2', text: 'Regulatory penalties for AML non-compliance increased 41% YoY across EMEA jurisdictions, with average fines exceeding $12M per incident.', sourceId: 's2', type: 'reg', credibility: 9.0, date: '2026-03-30', recency: 'fresh', problems: ['AML Compliance', 'Regulatory Risk'], contradiction: null },
  { id: 'c3', text: 'Peer-reviewed analysis confirms that AI-driven transaction monitoring reduces false positives by 67% while maintaining 99.2% detection sensitivity.', sourceId: 's5', type: 'peer', credibility: 8.9, date: '2026-03-29', recency: 'fresh', problems: ['Transaction Monitoring', 'AI Adoption'], contradiction: null },
  { id: 'c4', text: 'Fraud targeting rates for UHNW clients show no statistically significant deviation from general wealth population after controlling for exposure.', sourceId: 's3', type: 'ind', credibility: 6.8, date: '2025-11-14', recency: 'stale', problems: ['Fraud Risk'], contradiction: 'c1' },
  { id: 'c5', text: 'Cross-border payment corridors in Southeast Asia represent a $2.3T annual flow with less than 18% coverage by automated compliance screening.', sourceId: 's6', type: 'ind', credibility: 7.4, date: '2026-03-20', recency: 'aging', problems: ['Cross-Border Payments', 'Compliance Gap'], contradiction: null },
  { id: 'c6', text: 'The IC3 annual report documents a 22% surge in business email compromise targeting wealth management firms, with median losses of $480K per event.', sourceId: 's7', type: 'reg', credibility: 8.6, date: '2026-02-10', recency: 'aging', problems: ['BEC Fraud', 'Operational Risk'], contradiction: 'c10' },
  { id: 'c7', text: 'Client onboarding cycle times for HNW individuals average 14.3 business days, with KYC documentation as the primary bottleneck at 62% of elapsed time.', sourceId: 's8', type: 'ind', credibility: 7.1, date: '2025-12-02', recency: 'stale', problems: ['Onboarding', 'KYC'], contradiction: null },
  { id: 'c8', text: 'Generative AI adoption in compliance functions is projected to reach 45% penetration by Q4 2026, up from 12% in early 2025.', sourceId: 's4', type: 'ind', credibility: 7.8, date: '2026-03-25', recency: 'fresh', problems: ['AI Adoption', 'Compliance'], contradiction: null },
  { id: 'c9', text: 'FTC enforcement actions against deceptive financial marketing rose 35% in 2025, with digital channels accounting for 78% of violations.', sourceId: 's9', type: 'reg', credibility: 8.1, date: '2026-03-31', recency: 'fresh', problems: ['Marketing Compliance', 'Enforcement'], contradiction: null },
  { id: 'c10', text: 'BEC incidents targeting wealth management declined 8% in the latest quarter, attributed to improved email authentication adoption (DMARC/DKIM).', sourceId: 's4', type: 'ind', credibility: 7.3, date: '2026-03-25', recency: 'fresh', problems: ['BEC Fraud', 'Email Security'], contradiction: 'c6' },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const statusColor: Record<Source['status'], string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  stale: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeBadge: Record<Claim['type'], { label: string; cls: string }> = {
  reg: { label: 'REG', cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
  peer: { label: 'PEER', cls: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  ind: { label: 'IND', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
};

const recencyColor: Record<Claim['recency'], string> = {
  fresh: 'bg-emerald-500/20 text-emerald-400',
  aging: 'bg-amber-500/20 text-amber-400',
  stale: 'bg-red-500/20 text-red-400',
};

function credBar(val: number) {
  const pct = (val / 10) * 100;
  const color = val >= 8 ? 'bg-emerald-500' : val >= 6 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-zinc-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-400">{val}</span>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

function sourceName(id: string) {
  return SOURCES.find((s) => s.id === id)?.name ?? 'Unknown';
}

/* ------------------------------------------------------------------ */
/*  KPI STRIP                                                          */
/* ------------------------------------------------------------------ */

function KpiStrip() {
  const kpis: { label: string; value: string | number; color?: string }[] = [
    { label: 'Total Sources', value: 23 },
    { label: 'Claims Extracted', value: '1,247' },
    { label: 'Avg Credibility', value: 7.8 },
    { label: 'Stale Evidence', value: 3, color: 'text-amber-400' },
    { label: 'Contradictions', value: 12, color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-lg border border-zinc-700/60 bg-zinc-800/60 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{k.label}</p>
          <p className={`text-2xl font-bold ${k.color ?? 'text-zinc-100'}`}>{k.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RECENCY DECAY TIMELINE                                             */
/* ------------------------------------------------------------------ */

function RecencyDecayBar() {
  const months = Array.from({ length: 18 }, (_, i) => i + 1);
  return (
    <div className="rounded-lg border border-zinc-700/60 bg-zinc-800/60 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Recency Decay — 18-Month Window</h3>
      <div className="flex items-end gap-[3px] h-10">
        {months.map((m) => {
          const opacity = Math.max(0.08, 1 - (m - 1) / 17);
          const bg = m <= 6 ? 'bg-emerald-500' : m <= 12 ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div
              key={m}
              className={`flex-1 rounded-sm ${bg}`}
              style={{ height: `${opacity * 100}%`, opacity }}
              title={`Month ${m}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
        <span>1 mo (Fresh)</span>
        <span>6 mo</span>
        <span>12 mo</span>
        <span>18 mo (Stale)</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CONTRADICTION DRAWER                                               */
/* ------------------------------------------------------------------ */

function ContradictionDrawer({
  open,
  claimA,
  claimB,
  onClose,
}: {
  open: boolean;
  claimA: Claim | null;
  claimB: Claim | null;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-[520px] bg-zinc-900 border-l border-zinc-700 shadow-2xl transform transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <h2 className="text-lg font-bold text-zinc-100">Contradiction Analysis</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 text-xl leading-none">&times;</button>
      </div>
      {claimA && claimB && (
        <div className="p-5 space-y-6 overflow-y-auto h-[calc(100%-60px)]">
          {[claimA, claimB].map((c, idx) => (
            <div key={c.id} className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase">Claim {idx === 0 ? 'A' : 'B'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${typeBadge[c.type].cls}`}>
                  {typeBadge[c.type].label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${recencyColor[c.recency]}`}>{c.recency}</span>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">{c.text}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>{sourceName(c.sourceId)}</span>
                <span>{c.date}</span>
                {credBar(c.credibility)}
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-xs font-semibold text-amber-400 mb-1">Resolution Guidance</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              These claims present conflicting evidence. Review source methodology, sample sizes, and temporal context.
              Prefer the claim with higher credibility and more recent ingestion unless domain expertise suggests otherwise.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function EvidencePage() {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPair, setDrawerPair] = useState<[Claim, Claim] | null>(null);

  const filteredClaims = useMemo(() => {
    if (!search.trim()) return CLAIMS;
    const q = search.toLowerCase();
    return CLAIMS.filter(
      (c) =>
        c.text.toLowerCase().includes(q) ||
        sourceName(c.sourceId).toLowerCase().includes(q) ||
        c.problems.some((p) => p.toLowerCase().includes(q)),
    );
  }, [search]);

  const selectedClaim = CLAIMS.find((c) => c.id === selectedClaimId) ?? null;

  function openContradiction(claim: Claim) {
    if (!claim.contradiction) return;
    const other = CLAIMS.find((c) => c.id === claim.contradiction);
    if (!other) return;
    setDrawerPair([claim, other]);
    setDrawerOpen(true);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Evidence Viewer</h1>
        <p className="text-sm text-zinc-500 mt-1">Source management, claims browser, contradiction detection &amp; recency decay</p>
      </div>

      {/* KPI Strip */}
      <KpiStrip />

      {/* Recency Decay */}
      <RecencyDecayBar />

      {/* 3-Column Layout */}
      <div className="flex gap-5" style={{ minHeight: 560 }}>
        {/* ---- LEFT: Source Management ---- */}
        <div className="w-[260px] shrink-0 rounded-lg border border-zinc-700/60 bg-zinc-800/60 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Sources</h2>
            <button className="text-[11px] px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition">
              + Add Source
            </button>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-700/50">
            {SOURCES.map((s) => (
              <div key={s.id} className="p-3 hover:bg-zinc-700/30 transition space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">{s.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusColor[s.status]}`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <span>{s.claimCount} claims</span>
                  <span>cred {s.credibility}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600">Ingested {s.lastIngested}</span>
                  <button className="text-[10px] text-indigo-400 hover:text-indigo-300 transition">Re-ingest</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---- CENTER: Claims Browser ---- */}
        <div className="flex-1 rounded-lg border border-zinc-700/60 bg-zinc-800/60 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search claims, sources, problems..."
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2">Claim</th>
                  <th className="px-3 py-2 w-24">Source</th>
                  <th className="px-3 py-2 w-16 text-center">Type</th>
                  <th className="px-3 py-2 w-28">Credibility</th>
                  <th className="px-3 py-2 w-24">Date</th>
                  <th className="px-3 py-2 w-16 text-center">Recency</th>
                  <th className="px-3 py-2 w-36">Problems</th>
                  <th className="px-3 py-2 w-10 text-center">!</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700/40">
                {filteredClaims.map((c) => {
                  const hasContra = !!c.contradiction;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClaimId(c.id)}
                      className={`cursor-pointer transition ${
                        selectedClaimId === c.id
                          ? 'bg-indigo-500/10'
                          : hasContra
                            ? 'bg-amber-500/5 hover:bg-amber-500/10'
                            : 'hover:bg-zinc-700/30'
                      }`}
                    >
                      <td className="px-3 py-2 text-zinc-300 text-xs leading-snug">{truncate(c.text, 80)}</td>
                      <td className="px-3 py-2 text-xs text-zinc-400">{sourceName(c.sourceId)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${typeBadge[c.type].cls}`}>
                          {typeBadge[c.type].label}
                        </span>
                      </td>
                      <td className="px-3 py-2">{credBar(c.credibility)}</td>
                      <td className="px-3 py-2 text-xs text-zinc-500">{c.date}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${recencyColor[c.recency]}`}>
                          {c.recency}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {c.problems.map((p) => (
                            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {hasContra && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openContradiction(c);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-bold text-sm"
                            title="View contradiction"
                          >
                            ⚡
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- RIGHT: Claim Detail ---- */}
        <div className="w-[280px] shrink-0 rounded-lg border border-zinc-700/60 bg-zinc-800/60 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-zinc-700">
            <h2 className="text-sm font-semibold text-zinc-300">Claim Detail</h2>
          </div>
          {selectedClaim ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Type + Recency badges */}
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${typeBadge[selectedClaim.type].cls}`}>
                  {typeBadge[selectedClaim.type].label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${recencyColor[selectedClaim.recency]}`}>
                  {selectedClaim.recency}
                </span>
                {selectedClaim.contradiction && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    CONTRADICTION
                  </span>
                )}
              </div>

              {/* Full text */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Full Claim</p>
                <p className="text-sm text-zinc-200 leading-relaxed">{selectedClaim.text}</p>
              </div>

              {/* Source doc */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Source Document</p>
                <p className="text-sm text-zinc-300">{sourceName(selectedClaim.sourceId)}</p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Date</p>
                <p className="text-sm text-zinc-300">{selectedClaim.date}</p>
              </div>

              {/* Credibility Breakdown */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Credibility Breakdown</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Source Authority', val: Math.min(10, selectedClaim.credibility + 0.3) },
                    { label: 'Methodology', val: Math.min(10, selectedClaim.credibility - 0.2) },
                    { label: 'Recency', val: selectedClaim.recency === 'fresh' ? 9.0 : selectedClaim.recency === 'aging' ? 6.5 : 4.0 },
                    { label: 'Corroboration', val: selectedClaim.contradiction ? 5.0 : 8.0 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">{item.label}</span>
                      {credBar(Math.round(item.val * 10) / 10)}
                    </div>
                  ))}
                  <div className="pt-1 border-t border-zinc-700 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Overall</span>
                    {credBar(selectedClaim.credibility)}
                  </div>
                </div>
              </div>

              {/* Related Problems */}
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Related Problems</p>
                <div className="flex flex-wrap gap-1">
                  {selectedClaim.problems.map((p) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 text-xs px-3 py-1.5 rounded bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition">
                  Remove Claim
                </button>
                <button className="flex-1 text-xs px-3 py-1.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition">
                  Boost Credibility
                </button>
              </div>

              {/* Contradiction link */}
              {selectedClaim.contradiction && (
                <button
                  onClick={() => openContradiction(selectedClaim)}
                  className="w-full text-xs px-3 py-1.5 rounded bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 transition"
                >
                  View Contradiction
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-zinc-600 text-center">Select a claim from the table to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Contradiction Drawer */}
      <ContradictionDrawer
        open={drawerOpen}
        claimA={drawerPair?.[0] ?? null}
        claimB={drawerPair?.[1] ?? null}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Overlay when drawer open */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDrawerOpen(false)} />
      )}
    </div>
  );
}
