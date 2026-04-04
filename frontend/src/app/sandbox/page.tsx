'use client';

import { useState } from 'react';

/* ─── Inline Data ─── */

const SCENARIOS = [
  {
    id: 'uhnw-family',
    title: 'UHNW Family Office Prospect',
    description:
      'Multi-generational family office with $250M+ AUM seeking consolidated wealth management, tax optimization, and succession planning across three generations.',
    data: {
      name: 'Apex Holdings',
      type: 'Family Office',
      aum: '$275M',
      members: 12,
      priority: 'Succession Planning',
      riskScore: 'Low',
      stage: 'Discovery',
    },
  },
  {
    id: 'newly-wealthy',
    title: 'Newly Wealthy Founder',
    description:
      'Tech founder post-exit with $80M liquidity event. Needs estate structuring, philanthropic vehicle setup, and concentrated stock diversification strategy.',
    data: {
      name: 'Summit Trust',
      type: 'Individual — Post-Exit',
      aum: '$80M',
      members: 2,
      priority: 'Liquidity Diversification',
      riskScore: 'Medium',
      stage: 'Proposal',
    },
  },
  {
    id: 'at-risk',
    title: 'At-Risk Active Client',
    description:
      'Long-standing client showing declining engagement — missed reviews, reduced deposits, competitor inquiry detected. Retention playbook recommended.',
    data: {
      name: 'Meridian Partners',
      type: 'Active Client',
      aum: '$42M',
      members: 3,
      priority: 'Retention',
      riskScore: 'High',
      healthTrend: 'Declining',
      stage: 'At-Risk',
    },
  },
  {
    id: 'estate-planning',
    title: 'Estate Planning Opportunity',
    description:
      'Client anticipating $30M inheritance within 18 months. Needs trust structuring, tax-efficient transfer strategy, and updated beneficiary designations.',
    data: {
      name: 'Hargrove Estate',
      type: 'Estate / Inheritance',
      aum: '$30M (incoming)',
      members: 5,
      priority: 'Trust Structuring',
      riskScore: 'Low',
      stage: 'Qualification',
    },
  },
] as const;

const TEAM_MEMBERS = [
  {
    id: 'tm-1',
    name: 'Sarah Chen',
    role: 'Senior Advisor',
    completionPct: 72,
    actions: ['Completed discovery call sim', 'Passed objection handling', 'Pending: estate review'],
  },
  {
    id: 'tm-2',
    name: 'Marcus Rivera',
    role: 'Relationship Manager',
    completionPct: 45,
    actions: ['Completed intake form drill', 'In-progress: risk profiling'],
  },
  {
    id: 'tm-3',
    name: 'Priya Nair',
    role: 'Junior Analyst',
    completionPct: 91,
    actions: ['Completed all scenario walkthroughs', 'Passed compliance check', 'Completed portfolio review'],
  },
];

const ACTIVE_PILOTS = [
  {
    id: 'pl-1',
    prospect: 'Whitfield Capital',
    link: 'https://app.chamberforge.io/pilot/wf-capital-a3d9',
    created: '2026-03-28',
    views: 14,
    expires: '2026-04-04',
  },
  {
    id: 'pl-2',
    prospect: 'Nakamura Family Trust',
    link: 'https://app.chamberforge.io/pilot/nk-family-7e12',
    created: '2026-03-31',
    views: 6,
    expires: '2026-04-07',
  },
];

/* ─── Component ─── */

export default function SandboxPage() {
  const [activeScenario, setActiveScenario] = useState<(typeof SCENARIOS)[number] | null>(null);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0].id);
  const [selectedMember, setSelectedMember] = useState(TEAM_MEMBERS[0].id);
  const [trainingStarted, setTrainingStarted] = useState(false);
  const [pilotLink, setPilotLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGeneratePilot = () => {
    const id = Math.random().toString(36).slice(2, 10);
    setPilotLink(`https://app.chamberforge.io/pilot/demo-${id}`);
    setCopied(false);
  };

  const handleCopy = () => {
    if (pilotLink) {
      navigator.clipboard.writeText(pilotLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Amber Banner ── */}
      <div className="flex items-center justify-between bg-amber-600/90 px-6 py-3">
        <span className="font-semibold tracking-wide text-black">
          SANDBOX MODE &mdash; No real data
        </span>
        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="rounded border border-black/30 bg-black/20 px-4 py-1.5 text-sm font-medium text-black transition hover:bg-black/30"
        >
          Exit Sandbox
        </button>
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-8">
        {/* ══════════════ 1. Demo Scenarios ══════════════ */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">Demo Scenarios</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SCENARIOS.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-700"
              >
                <h3 className="mb-1 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">{s.description}</p>
                <button
                  onClick={() => setActiveScenario(s)}
                  className="rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                >
                  Load Scenario
                </button>
              </div>
            ))}
          </div>

          {/* Loaded scenario detail */}
          {activeScenario && (
            <div className="mt-6 rounded-lg border border-amber-500/30 bg-gray-900 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-bold text-amber-400">
                  Loaded: {activeScenario.data.name}
                </h3>
                <button
                  onClick={() => setActiveScenario(null)}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Dismiss
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Object.entries(activeScenario.data).map(([key, val]) => (
                  <div key={key} className="rounded bg-gray-800 px-3 py-2">
                    <span className="block text-xs uppercase tracking-wider text-gray-500">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-sm font-medium text-white">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ══════════════ 2. Team Training ══════════════ */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">Team Training</h2>

          <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-gray-800 bg-gray-900 p-5">
            <div className="flex-1">
              <label className="mb-1 block text-xs uppercase tracking-wider text-gray-500">
                Assign Scenario
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value)}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-xs uppercase tracking-wider text-gray-500">
                Team Member
              </label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.role}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setTrainingStarted(true)}
              className="rounded bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              Start Training
            </button>
          </div>

          {trainingStarted && (
            <p className="mb-4 text-sm text-amber-400">
              Training session started for{' '}
              <span className="font-semibold">
                {TEAM_MEMBERS.find((m) => m.id === selectedMember)?.name}
              </span>{' '}
              on{' '}
              <span className="font-semibold">
                {SCENARIOS.find((s) => s.id === selectedScenario)?.title}
              </span>
            </p>
          )}

          {/* Progress tracker */}
          <div className="space-y-4">
            {TEAM_MEMBERS.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{m.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{m.role}</span>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{m.completionPct}%</span>
                </div>

                {/* Progress bar */}
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${m.completionPct}%` }}
                  />
                </div>

                <ul className="space-y-1">
                  {m.actions.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          a.toLowerCase().startsWith('completed') || a.toLowerCase().startsWith('passed')
                            ? 'bg-emerald-500'
                            : a.toLowerCase().startsWith('pending')
                              ? 'bg-gray-600'
                              : 'bg-amber-500'
                        }`}
                      />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════ 3. Enterprise Pilot ══════════════ */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">Enterprise Pilot</h2>

          <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-5">
            <p className="mb-4 text-sm text-gray-400">
              Generate a shareable pilot link for prospects. Links expire after 7 days.
            </p>

            <button
              onClick={handleGeneratePilot}
              className="rounded bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              Generate Pilot Link
            </button>

            {pilotLink && (
              <div className="mt-4 flex items-center gap-3 rounded border border-gray-700 bg-gray-800 px-4 py-3">
                <code className="flex-1 truncate text-sm text-amber-300">{pilotLink}</code>
                <span className="text-xs text-gray-500">Expires in 7 days</span>
                <button
                  onClick={handleCopy}
                  className="rounded border border-gray-600 bg-gray-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-gray-600"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Active pilots table */}
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 bg-gray-900 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Prospect</th>
                  <th className="px-4 py-3">Link</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900/50">
                {ACTIVE_PILOTS.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-900">
                    <td className="px-4 py-3 font-medium text-white">{p.prospect}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-amber-300">{p.link}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.created}</td>
                    <td className="px-4 py-3 text-gray-400">{p.views}</td>
                    <td className="px-4 py-3 text-gray-400">{p.expires}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
