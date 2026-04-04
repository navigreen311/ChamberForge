'use client';

import React, { useState, useMemo } from 'react';

/* ─── Inline Data ─────────────────────────────────────────────────────── */

type VettingStatus = 'Vetted' | 'Pending' | 'Expired';

interface Partner {
  id: number;
  name: string;
  specialty: string;
  location: string;
  vettingStatus: VettingStatus;
  licenseStatus: string;
  performanceScore: number;
  compatiblePlaybooks: number;
}

const PARTNERS: Partner[] = [
  { id: 1, name: 'Mitchell & Associates', specialty: 'Estate Attorney', location: 'New York, NY', vettingStatus: 'Vetted', licenseStatus: 'Active', performanceScore: 9.1, compatiblePlaybooks: 4 },
  { id: 2, name: 'Apex Security Consulting', specialty: 'Cybersecurity', location: 'London, UK', vettingStatus: 'Vetted', licenseStatus: 'Active', performanceScore: 8.5, compatiblePlaybooks: 2 },
  { id: 3, name: 'Dr. Sarah Kim', specialty: 'Concierge Physician', location: 'San Francisco, CA', vettingStatus: 'Vetted', licenseStatus: 'Active', performanceScore: 8.8, compatiblePlaybooks: 1 },
  { id: 4, name: 'Pacific Insurance Advisors', specialty: 'Insurance', location: 'Los Angeles, CA', vettingStatus: 'Pending', licenseStatus: 'Under Review', performanceScore: 7.2, compatiblePlaybooks: 1 },
  { id: 5, name: 'Reed Financial Group', specialty: 'Wealth Manager', location: 'Chicago, IL', vettingStatus: 'Vetted', licenseStatus: 'Active', performanceScore: 8.0, compatiblePlaybooks: 3 },
  { id: 6, name: 'Guardian Background Services', specialty: 'Background Check', location: 'Remote', vettingStatus: 'Expired', licenseStatus: 'Lapsed', performanceScore: 6.5, compatiblePlaybooks: 0 },
];

const SPECIALTIES = Array.from(new Set(PARTNERS.map(p => p.specialty)));
const JURISDICTIONS = Array.from(new Set(PARTNERS.map(p => p.location)));
const STATUSES: VettingStatus[] = ['Vetted', 'Pending', 'Expired'];

const VETTING_STEPS = [
  { title: 'Identity Verification', desc: 'Confirm legal identity, business registration, and principal contacts.' },
  { title: 'License & Credential Check', desc: 'Validate professional licenses, certifications, and insurance coverage.' },
  { title: 'Background Screening', desc: 'Criminal history, litigation records, and sanctions list review.' },
  { title: 'Reference & Reputation', desc: 'Collect references, review client feedback, and industry reputation.' },
  { title: 'Final Approval', desc: 'Committee review, risk scoring, and partnership agreement execution.' },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function statusColor(s: VettingStatus) {
  if (s === 'Vetted') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (s === 'Pending') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function statusDot(s: VettingStatus) {
  if (s === 'Vetted') return 'bg-emerald-400';
  if (s === 'Pending') return 'bg-amber-400';
  return 'bg-red-400';
}

function scoreColor(score: number) {
  if (score >= 8.5) return 'text-emerald-400';
  if (score >= 7) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBar(score: number) {
  const pct = (score / 10) * 100;
  if (score >= 8.5) return 'bg-emerald-500';
  if (score >= 7) return 'bg-amber-500';
  return 'bg-red-500';
}

/* ─── KPI Card ────────────────────────────────────────────────────────── */

function KpiCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-700/60 bg-zinc-800/80 px-5 py-4">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">{label}</span>
      <span className={`text-2xl font-bold ${accent ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

/* ─── Partner Card ────────────────────────────────────────────────────── */

function PartnerCard({ p, onAssign }: { p: Partner; onAssign: (name: string) => void }) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-zinc-700/50 bg-zinc-800/70 p-5 transition hover:border-zinc-600 hover:bg-zinc-800">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-white">{p.name}</h3>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(p.vettingStatus)}`}>
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDot(p.vettingStatus)}`} />
            {p.vettingStatus}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-medium text-indigo-300">{p.specialty}</span>
          <span className="rounded-md bg-zinc-700/60 px-2 py-0.5 text-xs text-zinc-300">{p.location}</span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">License</span>
            <span className="text-zinc-200">{p.licenseStatus}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Performance</span>
            <span className={`font-semibold ${scoreColor(p.performanceScore)}`}>{p.performanceScore.toFixed(1)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-700">
            <div className={`h-full rounded-full ${scoreBar(p.performanceScore)}`} style={{ width: `${(p.performanceScore / 10) * 100}%` }} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Playbooks</span>
            <span className="text-zinc-200">{p.compatiblePlaybooks} compatible</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-2">
        <button className="flex-1 rounded-lg border border-zinc-600 bg-zinc-700/50 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700">
          View Profile
        </button>
        <button
          onClick={() => onAssign(p.name)}
          className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Assign
        </button>
      </div>
    </div>
  );
}

/* ─── Rev-Share Calculator ────────────────────────────────────────────── */

function RevShareCalc() {
  const [engagement, setEngagement] = useState('');
  const [pct, setPct] = useState('15');

  const engVal = parseFloat(engagement) || 0;
  const pctVal = parseFloat(pct) || 0;
  const partnerShare = engVal * (pctVal / 100);
  const netRetained = engVal - partnerShare;

  return (
    <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/70 p-6">
      <h2 className="text-lg font-semibold text-white">Rev-Share Calculator</h2>
      <p className="mt-1 text-sm text-zinc-400">Estimate partner revenue split for an engagement.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Engagement Value ($)</label>
          <input
            type="number"
            value={engagement}
            onChange={e => setEngagement(e.target.value)}
            placeholder="e.g. 50000"
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Partner Share (%)</label>
          <input
            type="number"
            value={pct}
            onChange={e => setPct(e.target.value)}
            min={0}
            max={100}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {engVal > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl border border-zinc-700/40 bg-zinc-900/40 p-4">
          <div className="text-center">
            <p className="text-xs text-zinc-500">Engagement</p>
            <p className="text-lg font-bold text-white">${engVal.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Partner Share</p>
            <p className="text-lg font-bold text-amber-400">${partnerShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Net Retained</p>
            <p className="text-lg font-bold text-emerald-400">${netRetained.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Vetting Wizard Modal ────────────────────────────────────────────── */

function VettingWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState<boolean[]>(new Array(VETTING_STEPS.length).fill(false));

  if (!open) return null;

  const toggle = (i: number) => {
    const next = [...checks];
    next[i] = !next[i];
    setChecks(next);
  };

  const canNext = checks[step];
  const isLast = step === VETTING_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Partner Vetting Wizard</h2>
          <button onClick={onClose} className="text-zinc-400 transition hover:text-white">&times;</button>
        </div>

        {/* Step indicators */}
        <div className="mt-4 flex gap-2">
          {VETTING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i < step ? 'bg-emerald-500' : i === step ? 'bg-indigo-500' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>

        <p className="mt-1 text-right text-xs text-zinc-500">Step {step + 1} of {VETTING_STEPS.length}</p>

        {/* Current step */}
        <div className="mt-4 rounded-xl border border-zinc-700/50 bg-zinc-800/60 p-5">
          <h3 className="text-base font-semibold text-white">{VETTING_STEPS[step].title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{VETTING_STEPS[step].desc}</p>

          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={checks[step]}
              onChange={() => toggle(step)}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-indigo-500 focus:ring-indigo-500"
            />
            <span className="text-sm text-zinc-300">Mark this step as complete</span>
          </label>
        </div>

        {/* Navigation */}
        <div className="mt-5 flex justify-between">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-40"
          >
            Back
          </button>
          {isLast ? (
            <button
              onClick={() => { onClose(); setStep(0); setChecks(new Array(VETTING_STEPS.length).fill(false)); }}
              disabled={!canNext}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-40"
            >
              Complete Vetting
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-40"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function PartnersPage() {
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [filterJurisdiction, setFilterJurisdiction] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'All' | VettingStatus>('All');
  const [wizardOpen, setWizardOpen] = useState(false);

  const filtered = useMemo(() => {
    return PARTNERS.filter(p => {
      if (filterSpecialty !== 'All' && p.specialty !== filterSpecialty) return false;
      if (filterJurisdiction !== 'All' && p.location !== filterJurisdiction) return false;
      if (filterStatus !== 'All' && p.vettingStatus !== filterStatus) return false;
      return true;
    });
  }, [filterSpecialty, filterJurisdiction, filterStatus]);

  const handleAssign = (name: string) => {
    alert(`Assign workflow started for ${name}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partner Ops Vault</h1>
            <p className="mt-1 text-sm text-zinc-400">Manage vetted partners, track performance, and calculate rev-share splits.</p>
          </div>
          <button
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Start Vetting
          </button>
        </div>

        {/* KPI Strip */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="Total Partners" value="8" />
          <KpiCard label="Active (90d)" value="5" accent="text-emerald-400" />
          <KpiCard label="Avg Vetting Score" value="8.2" accent="text-indigo-400" />
          <KpiCard label="Re-screen Needed" value="1" accent="text-amber-400" />
          <KpiCard label="Rev-Share (Q)" value="$12.4K" accent="text-emerald-400" />
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Specialty</label>
            <select
              value={filterSpecialty}
              onChange={e => setFilterSpecialty(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
            >
              <option value="All">All Specialties</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Jurisdiction</label>
            <select
              value={filterJurisdiction}
              onChange={e => setFilterJurisdiction(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
            >
              <option value="All">All Locations</option>
              {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Vetting Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'All' | VettingStatus)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setFilterSpecialty('All'); setFilterJurisdiction('All'); setFilterStatus('All'); }}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
          >
            Reset
          </button>
        </div>

        {/* Partner Cards Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length > 0 ? (
            filtered.map(p => <PartnerCard key={p.id} p={p} onAssign={handleAssign} />)
          ) : (
            <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-900/40 py-16 text-center">
              <p className="text-zinc-500">No partners match the current filters.</p>
            </div>
          )}
        </div>

        {/* Rev-Share Calculator */}
        <div className="mt-10">
          <RevShareCalc />
        </div>
      </div>

      {/* Vetting Wizard Modal */}
      <VettingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
