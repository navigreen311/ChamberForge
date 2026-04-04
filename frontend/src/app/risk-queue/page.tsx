'use client';

import { useState, useMemo } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
type RiskLevel = 'Critical' | 'High' | 'Medium';
type Status = 'Pending' | 'Approved' | 'Rejected' | 'Escalated' | 'Archived';
type ItemType = 'Guardrails' | 'Compliance' | 'Surveillance' | 'Geo-legal' | 'Medical';

interface QueueItem {
  id: number;
  title: string;
  description: string;
  type: ItemType;
  sourceModule: string;
  riskLevel: RiskLevel;
  flaggedDate: string;
  reviewer: string;
  status: Status;
  aiOutput: string;
  triggeredRule: string;
  evidence: string;
}

interface GuardrailRule {
  id: string;
  name: string;
  description: string;
}

// ── Inline Data ────────────────────────────────────────────────────────────────
const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 1, title: 'Medical Navigation Licensed Care', description: 'AI output references unlicensed medical guidance for HNW client wellness plan',
    type: 'Medical', sourceModule: 'Guardrails Engine', riskLevel: 'Critical', flaggedDate: '2026-04-03 09:12',
    reviewer: 'Sarah Chen', status: 'Pending',
    aiOutput: 'The wellness concierge module generated a care navigation pathway that included specific dosage recommendations and treatment protocols without verifying provider licensure status in the client\'s jurisdiction.',
    triggeredRule: 'MED-001', evidence: 'Output contained phrases: "recommended dosage", "treatment protocol", "prescribe" without licensed-provider attribution.',
  },
  {
    id: 2, title: 'EU/US Cross-Border Data Transfer', description: 'Geo-intelligence flagged potential GDPR violation in client data routing',
    type: 'Geo-legal', sourceModule: 'Geo Intelligence', riskLevel: 'High', flaggedDate: '2026-04-03 08:45',
    reviewer: 'James Wright', status: 'Pending',
    aiOutput: 'Client portfolio data for EU-domiciled individual was routed through US-based processing node without adequate GDPR transfer mechanism verification.',
    triggeredRule: 'GEO-002', evidence: 'Data routing log shows transfer to us-east-1 node for EU-flagged client ID #4471.',
  },
  {
    id: 3, title: 'Guarantee Language in AI Output', description: 'AI Explainability module detected prohibited guarantee phrasing',
    type: 'Compliance', sourceModule: 'AI Explainability', riskLevel: 'High', flaggedDate: '2026-04-03 07:30',
    reviewer: 'Maria Lopez', status: 'Pending',
    aiOutput: 'The investment recommendation module produced language stating "guaranteed returns of 8% annually" in a client-facing wealth summary report.',
    triggeredRule: 'COMP-003', evidence: 'Phrase match: "guaranteed returns" detected in output buffer at token position 847.',
  },
  {
    id: 4, title: 'Surveillance Pattern Detection', description: 'Behavioral monitoring flagged unusual access pattern resembling surveillance',
    type: 'Surveillance', sourceModule: 'Guardrails Engine', riskLevel: 'Critical', flaggedDate: '2026-04-02 16:20',
    reviewer: 'David Kim', status: 'Pending',
    aiOutput: 'Automated behavioral analysis detected a pattern consistent with systematic profiling: 47 sequential client record accesses within 3 minutes from a single advisor session.',
    triggeredRule: 'SURV-001', evidence: 'Access log spike: 47 records in 180s from session #AX-9912. Threshold: 10/min.',
  },
  {
    id: 5, title: 'Tax Advice Reference', description: 'Compliance check flagged specific tax advisory language without disclaimer',
    type: 'Compliance', sourceModule: 'Compliance Monitor', riskLevel: 'Medium', flaggedDate: '2026-04-02 14:55',
    reviewer: 'Emily Park', status: 'Pending',
    aiOutput: 'Client communication draft included specific tax optimization strategies referencing IRC Section 1031 exchanges without required "not tax advice" disclaimer.',
    triggeredRule: 'COMP-001', evidence: 'Missing disclaimer flag on output containing "tax optimization", "1031 exchange".',
  },
  {
    id: 6, title: 'Portfolio Rebalance Override', description: 'Auto-rebalance exceeded risk tolerance threshold for conservative client',
    type: 'Guardrails', sourceModule: 'Portfolio Engine', riskLevel: 'High', flaggedDate: '2026-04-01 11:00',
    reviewer: 'Sarah Chen', status: 'Approved',
    aiOutput: 'Rebalancing algorithm shifted 22% of conservative-profile portfolio into high-yield emerging market bonds.', triggeredRule: 'GUARD-002',
    evidence: 'Risk score delta: +34 points above client tolerance band.',
  },
  {
    id: 7, title: 'Client Profiling Bias Flag', description: 'AI fairness audit detected potential demographic bias in risk scoring',
    type: 'Guardrails', sourceModule: 'Fairness Auditor', riskLevel: 'High', flaggedDate: '2026-03-31 09:15',
    reviewer: 'James Wright', status: 'Approved',
    aiOutput: 'Fairness audit revealed 12% scoring disparity correlated with postal code proxy variable.', triggeredRule: 'GUARD-004',
    evidence: 'Statistical significance p<0.01 on postal-code correlation in risk model v3.2.',
  },
  {
    id: 8, title: 'Unauthorized Data Enrichment', description: 'External data source used without client consent verification',
    type: 'Compliance', sourceModule: 'Data Governance', riskLevel: 'Medium', flaggedDate: '2026-03-30 15:40',
    reviewer: 'Maria Lopez', status: 'Rejected',
    aiOutput: 'Client enrichment pipeline ingested social media sentiment data without verifying opt-in consent.', triggeredRule: 'COMP-002',
    evidence: 'Consent flag: NULL for data source "social-sentiment-v2" on 3 client records.',
  },
  {
    id: 9, title: 'Cross-Jurisdictional Advisory Conflict', description: 'Conflicting regulatory requirements detected across client jurisdictions',
    type: 'Geo-legal', sourceModule: 'Geo Intelligence', riskLevel: 'High', flaggedDate: '2026-03-29 10:30',
    reviewer: 'David Kim', status: 'Escalated',
    aiOutput: 'Advisory output compliant with US SEC regulations but violates MiFID II requirements for the same dual-domiciled client.', triggeredRule: 'GEO-001',
    evidence: 'Dual jurisdiction flag on client #7823. SEC Rule 206(4) vs MiFID II Art. 24.',
  },
  {
    id: 10, title: 'Wellness Module Overreach', description: 'Health-related AI output exceeded permissible advisory scope',
    type: 'Medical', sourceModule: 'Wellness Concierge', riskLevel: 'Medium', flaggedDate: '2026-03-28 13:20',
    reviewer: 'Emily Park', status: 'Escalated',
    aiOutput: 'Wellness module provided mental health assessment language that constitutes practicing psychology without license.', triggeredRule: 'MED-002',
    evidence: 'Output contains diagnostic language: "symptoms consistent with", "clinical presentation".',
  },
  {
    id: 11, title: 'Insider Trading Signal Suppression', description: 'Surveillance module detected suppressed alert for suspicious trading pattern',
    type: 'Surveillance', sourceModule: 'Trade Surveillance', riskLevel: 'Critical', flaggedDate: '2026-03-27 08:00',
    reviewer: 'Sarah Chen', status: 'Approved',
    aiOutput: 'Alert for correlated trading activity 48h before public M&A announcement was auto-classified as false positive by ML model.', triggeredRule: 'SURV-002',
    evidence: 'Trade correlation: 0.94 with undisclosed M&A target. Auto-dismiss confidence: 0.51 (below 0.8 threshold).',
  },
  {
    id: 12, title: 'Legacy System Data Leak Vector', description: 'Archived integration path still active with deprecated encryption',
    type: 'Compliance', sourceModule: 'Infrastructure Audit', riskLevel: 'Medium', flaggedDate: '2026-03-25 16:45',
    reviewer: 'James Wright', status: 'Archived',
    aiOutput: 'Deprecated TLS 1.0 endpoint still active on legacy integration path for archived client data export.', triggeredRule: 'COMP-004',
    evidence: 'Port scan: TLS 1.0 handshake successful on endpoint /api/v1/legacy-export.',
  },
];

const GUARDRAIL_RULES: GuardrailRule[] = [
  { id: 'MED-001', name: 'Licensed Medical Guidance', description: 'AI must not provide medical recommendations without verified licensed-provider attribution.' },
  { id: 'GEO-002', name: 'Cross-Border Data Transfer', description: 'Client data must not traverse jurisdictional boundaries without validated transfer mechanism.' },
  { id: 'COMP-003', name: 'Prohibited Financial Language', description: 'AI outputs must not contain guarantee language, absolute return promises, or misleading performance claims.' },
  { id: 'SURV-001', name: 'Surveillance Pattern Threshold', description: 'Sequential record access exceeding 10/min triggers mandatory review for surveillance behavior.' },
  { id: 'GUARD-002', name: 'Risk Tolerance Breach', description: 'Automated actions must not exceed client risk tolerance band by more than 15 points without human approval.' },
  { id: 'COMP-001', name: 'Tax Advisory Disclaimer', description: 'Any output referencing tax strategy must include mandated "not tax advice" disclaimer language.' },
];

type FilterTab = 'All' | Status;

// ── Helpers ────────────────────────────────────────────────────────────────────
const riskColor: Record<RiskLevel, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Medium: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const statusColor: Record<Status, string> = {
  Pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  Escalated: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Archived: 'bg-zinc-600/20 text-zinc-500 border-zinc-600/30',
};

const typeBadgeColor: Record<ItemType, string> = {
  Guardrails: 'bg-blue-500/15 text-blue-400',
  Compliance: 'bg-teal-500/15 text-teal-400',
  Surveillance: 'bg-orange-500/15 text-orange-400',
  'Geo-legal': 'bg-indigo-500/15 text-indigo-400',
  Medical: 'bg-rose-500/15 text-rose-400',
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function RiskQueuePage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [items, setItems] = useState(QUEUE_ITEMS);
  const [activeRule, setActiveRule] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState('');

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = { All: items.length, Pending: 0, Approved: 0, Rejected: 0, Escalated: 0, Archived: 0 };
    items.forEach((i) => counts[i.status]++);
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    let list = activeTab === 'All' ? items : items.filter((i) => i.status === activeTab);
    if (activeRule) list = list.filter((i) => i.triggeredRule === activeRule);
    return list;
  }, [items, activeTab, activeRule]);

  const openDrawer = (item: QueueItem) => { setSelectedItem(item); setDrawerOpen(true); setActionNote(''); };
  const closeDrawer = () => { setDrawerOpen(false); setSelectedItem(null); };

  const updateStatus = (id: number, status: Status) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    closeDrawer();
  };

  const tabs: FilterTab[] = ['All', 'Pending', 'Approved', 'Rejected', 'Escalated', 'Archived'];

  // ── KPIs ─────────────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Pending', value: tabCounts.Pending, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Approved Today', value: 3, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Rejected Today', value: 1, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Avg Review Time', value: '2.4h', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
    { label: 'Compliance Score', value: '91%', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Risk Review Queue</h1>
            <p className="text-sm text-zinc-500 mt-0.5">AI-generated content flagged for human review</p>
          </div>
          <span className="text-xs text-zinc-600">Last refreshed: {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* KPI Strip */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {kpis.map((k) => (
              <div key={k.label} className={`rounded-lg border px-4 py-3 ${k.bg}`}>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{k.label}</p>
                <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mb-4 border-b border-zinc-800 pb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setActiveRule(null); }}
                className={`px-4 py-2 text-sm rounded-t-md transition-colors ${
                  activeTab === tab
                    ? 'bg-zinc-800 text-white border-b-2 border-sky-500'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                {tab} <span className="ml-1 text-xs opacity-60">({tabCounts[tab]})</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="px-3 py-3 text-left w-10">#</th>
                  <th className="px-3 py-3 text-left">Item</th>
                  <th className="px-3 py-3 text-left w-28">Type</th>
                  <th className="px-3 py-3 text-left w-36">Source Module</th>
                  <th className="px-3 py-3 text-left w-24">Risk</th>
                  <th className="px-3 py-3 text-left w-36">Flagged</th>
                  <th className="px-3 py-3 text-left w-28">Reviewer</th>
                  <th className="px-3 py-3 text-left w-24">Status</th>
                  <th className="px-3 py-3 text-left w-52">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-zinc-900/40 transition-colors ${
                      activeRule && item.triggeredRule === activeRule ? 'bg-sky-500/5 ring-1 ring-inset ring-sky-500/20' : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-zinc-600 font-mono">{item.id}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-200">{item.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{item.description}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor[item.type]}`}>{item.type}</span>
                    </td>
                    <td className="px-3 py-3 text-zinc-400 text-xs">{item.sourceModule}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded border ${riskColor[item.riskLevel]}`}>{item.riskLevel}</span>
                    </td>
                    <td className="px-3 py-3 text-zinc-500 text-xs font-mono">{item.flaggedDate}</td>
                    <td className="px-3 py-3 text-zinc-400 text-xs">{item.reviewer}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[item.status]}`}>{item.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openDrawer(item)} className="px-2.5 py-1 text-xs rounded bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 transition-colors">Review</button>
                        {item.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(item.id, 'Approved')} className="px-2.5 py-1 text-xs rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors">Approve</button>
                            <button onClick={() => updateStatus(item.id, 'Rejected')} className="px-2.5 py-1 text-xs rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">Reject</button>
                            <button onClick={() => updateStatus(item.id, 'Escalated')} className="px-2.5 py-1 text-xs rounded bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors">Escalate</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-zinc-600">No items match the current filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Right Panel — Rule Reference */}
        <aside className="w-72 border-l border-zinc-800 p-4 bg-zinc-900/30 shrink-0">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-3 font-semibold">Rule Reference</h2>
          <div className="space-y-2">
            {GUARDRAIL_RULES.map((rule) => (
              <button
                key={rule.id}
                onClick={() => setActiveRule(activeRule === rule.id ? null : rule.id)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  activeRule === rule.id
                    ? 'border-sky-500/40 bg-sky-500/10 ring-1 ring-sky-500/20'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{rule.id}</span>
                  <span className="text-xs font-medium text-zinc-300">{rule.name}</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">{rule.description}</p>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Review Drawer Overlay */}
      {drawerOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={closeDrawer} />}

      {/* Review Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-zinc-900 border-l border-zinc-800 z-50 transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {selectedItem && (
          <>
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500 font-mono">#{selectedItem.id} &middot; {selectedItem.triggeredRule}</p>
                <h3 className="text-lg font-bold mt-0.5">{selectedItem.title}</h3>
              </div>
              <button onClick={closeDrawer} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">&times;</button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Meta badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor[selectedItem.type]}`}>{selectedItem.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${riskColor[selectedItem.riskLevel]}`}>{selectedItem.riskLevel}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[selectedItem.status]}`}>{selectedItem.status}</span>
              </div>

              <p className="text-sm text-zinc-400">{selectedItem.description}</p>

              {/* AI Output */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Full AI Output</h4>
                <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 leading-relaxed">
                  {selectedItem.aiOutput}
                </div>
              </div>

              {/* Triggered Rule */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Triggered Guardrail Rule</h4>
                <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-sky-400">{selectedItem.triggeredRule}</span>
                  <p className="text-sm text-zinc-400 mt-2">
                    {GUARDRAIL_RULES.find((r) => r.id === selectedItem.triggeredRule)?.description ?? 'Rule definition not found.'}
                  </p>
                </div>
              </div>

              {/* Evidence */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Evidence</h4>
                <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 font-mono leading-relaxed">
                  {selectedItem.evidence}
                </div>
              </div>

              {/* Source & Reviewer */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500">Source Module</p>
                  <p className="text-zinc-300 mt-0.5">{selectedItem.sourceModule}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Reviewer</p>
                  <p className="text-zinc-300 mt-0.5">{selectedItem.reviewer}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Flagged</p>
                  <p className="text-zinc-300 mt-0.5 font-mono">{selectedItem.flaggedDate}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedItem.status === 'Pending' && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Review Notes</h4>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={3}
                    placeholder="Add notes for approval, rejection reason, or escalation context..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/50 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {selectedItem.status === 'Pending' && (
              <div className="px-6 py-4 border-t border-zinc-800 flex gap-3">
                <button
                  onClick={() => updateStatus(selectedItem.id, 'Approved')}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                >
                  Approve with Notes
                </button>
                <button
                  onClick={() => updateStatus(selectedItem.id, 'Rejected')}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                >
                  Reject with Reason
                </button>
                <button
                  onClick={() => updateStatus(selectedItem.id, 'Escalated')}
                  className="py-2.5 px-4 rounded-lg border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 text-sm font-medium transition-colors"
                >
                  Escalate
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
