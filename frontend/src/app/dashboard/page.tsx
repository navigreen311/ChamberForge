'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopBar from '../components/shared/TopBar'
import CommandAIButton from '../components/shared/CommandAIButton'

// ─── Inline Data ──────────────────────────────────────────────
const KPIS = [
  { label: 'ACTIVE CLIENTS', value: '12', trend: '▲ +3', up: true },
  { label: 'MONTHLY RETAINER', value: '$284K', trend: '▲ +18%', up: true },
  { label: 'PIPELINE VALUE', value: '$1.4M', trend: '▲ +42%', up: true },
  { label: 'AVG HEALTH SCORE', value: '82.4', trend: '▼ -2.1', up: false },
  { label: 'WEALTH EVENTS', value: '7', trend: '▲ +4', up: true },
  { label: 'RISK QUEUE', value: '3', trend: '▲ +1', up: true },
]

const CLIENTS = [
  { name: 'Sarah Chen', score: 87, status: 'Stable — all KPIs on track', color: 'border-emerald-500', textColor: 'text-emerald-400' },
  { name: 'Wellington Trust', score: 62, status: 'At risk — missed last review', color: 'border-amber-500', textColor: 'text-amber-400' },
  { name: 'Harrington Dynasty', score: 94, status: 'Thriving — upsell opportunity', color: 'border-emerald-500', textColor: 'text-emerald-400' },
  { name: 'New Prospect', score: 0, status: 'Onboarding — day 12 of 90', color: 'border-blue-500', textColor: 'text-blue-400' },
]

const OPPORTUNITIES = [
  { rank: 1, problem: 'AI Voice Cloning Wire Fraud', tier: 'UHNW', lifecycle: 'Emerging', offer: 'Family Cyber Command', probability: 89, impact: 9.2, composite: 8.2, action: 'Close deal' },
  { rank: 2, problem: 'Coordination Overload', tier: 'HNW', lifecycle: 'Accelerating', offer: 'Private Ops Office', probability: 76, impact: 7.8, composite: 5.9, action: 'Build offer' },
  { rank: 3, problem: 'Data Broker Exposure', tier: 'UHNW', lifecycle: 'Proven', offer: 'Footprint Reduction', probability: 65, impact: 6.5, composite: 4.2, action: 'Validate' },
  { rank: 4, problem: 'Succession Conflict', tier: 'HNW', lifecycle: 'Accelerating', offer: '—', probability: 52, impact: 8.1, composite: 4.2, action: 'Build offer' },
  { rank: 5, problem: 'Insurance Hardening', tier: 'HNW', lifecycle: 'Saturated', offer: 'Property Resilience', probability: 41, impact: 5.2, composite: 2.1, action: 'Review' },
]

const EVENTS = [
  { type: 'exit', dot: 'bg-[#C9A84C]', text: 'Marcus Reid completed Series C exit ($120M)', time: '2 hours ago' },
  { type: 'inheritance', dot: 'bg-purple-400', text: 'Thornton estate transfer initiated ($45M)', time: '5 hours ago' },
  { type: 'ipo', dot: 'bg-emerald-400', text: 'Greenfield Biotech IPO — founder liquidity event', time: '1 day ago' },
  { type: 'board', dot: 'bg-blue-400', text: 'Diana Walsh appointed to Meridian Capital board', time: '2 days ago' },
]

const AGENTS = [
  { name: 'Command AI', status: 'active', last: '2 min ago', count: 47 },
  { name: 'Research AI', status: 'busy', last: 'Running...', count: 12 },
  { name: 'Problem AI', status: 'idle', last: '1 hour ago', count: 8 },
  { name: 'Offer AI', status: 'active', last: '15 min ago', count: 23 },
  { name: 'Pricing AI', status: 'idle', last: '3 hours ago', count: 15 },
  { name: 'Validator AI', status: 'active', last: '30 min ago', count: 31 },
  { name: 'Copy AI', status: 'idle', last: '2 hours ago', count: 19 },
  { name: 'Relationship AI', status: 'error', last: 'Failed', count: 5 },
  { name: 'Proof AI', status: 'idle', last: '4 hours ago', count: 11 },
  { name: 'Fulfillment AI', status: 'active', last: '8 min ago', count: 7 },
]

const RISKS = [
  { title: 'Medical navigation offer references licensed care', desc: 'Guardrails Engine flagged regulated domain.', severity: 'critical', module: 'Guardrails Engine' },
  { title: 'Cross-border data handling — EU/US', desc: 'Geo Intelligence flagged GDPR compliance check.', severity: 'high', module: 'Geo Intelligence' },
  { title: 'Guarantee language in Ecosystem Orchestrator', desc: 'AI Explainability flagged outcome promises.', severity: 'high', module: 'AI Explainability' },
]

const CHANGES = [
  'Wellington Trust health score dropped from 71 to 62',
  'New evidence: FBI AI impersonation alert (credibility 9.2)',
  'Private Ops Office offer moved to active',
  '2 new wealth events detected',
]

const ALERTS = [
  { sev: 'critical', msg: 'Wellington Trust health below 65 — intervention recommended' },
  { sev: 'high', msg: 'Evidence "UBS Report 2024" approaching 18-month staleness' },
  { sev: 'high', msg: 'FTC data broker rules update effective next month' },
]

// ─── Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [showEvidence, setShowEvidence] = useState(false)
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set([2]))

  const toggleAction = (i: number) => {
    const next = new Set(checkedActions)
    next.has(i) ? next.delete(i) : next.add(i)
    setCheckedActions(next)
  }

  const statusDot: Record<string, string> = {
    active: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]',
    busy: 'bg-amber-400 animate-pulse',
    idle: 'bg-gray-500',
    error: 'bg-red-500',
  }

  const lifecycleColor: Record<string, string> = {
    Emerging: 'bg-blue-900/50 text-blue-400',
    Accelerating: 'bg-emerald-900/50 text-emerald-400',
    Proven: 'bg-purple-900/50 text-purple-400',
    Saturated: 'bg-gray-800 text-gray-400',
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* ── TopBar ─────────────────────────────────────── */}
      <TopBar activePage="Dashboard" />
      <CommandAIButton />

      <div className="px-6 py-4">
        {/* ── KPI Strip ──────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4">
          {KPIS.map(k => (
            <div key={k.label} className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{k.label}</div>
              <div className="text-xl font-semibold mt-1">{k.value}</div>
              <div className={`text-[11px] mt-1 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>{k.trend}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-6">
          {/* ── Left Column ────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* Command AI Card */}
            <div className="bg-[#111827] border border-[#C9A84C]/40 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center gap-1.5 bg-red-900/50 text-red-400 text-[10px] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> HIGH PRIORITY
                </span>
                <span className="text-sm text-[#C9A84C]">94% confidence</span>
              </div>
              <h3 className="text-lg font-semibold mt-3">Activate Family Cyber Command for Wellington Trust</h3>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">The Wellington Family Trust experienced a near-miss wire fraud attempt last week. Their current cybersecurity posture has significant gaps.</p>
              <div className="mt-2">
                <span className="text-gray-500 text-xs uppercase">Why: </span>
                <span className="text-sm text-gray-400 italic">FBI alert on AI voice cloning + client incident report + Deloitte survey showing 68% of FOs lack incident response plans.</span>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="bg-[#1e2a3a] text-[#C9A84C] text-xs px-2 py-1 rounded cursor-pointer hover:bg-[#C9A84C]/20">Wellington Trust</span>
                <span className="bg-[#1e2a3a] text-[#C9A84C] text-xs px-2 py-1 rounded cursor-pointer hover:bg-[#C9A84C]/20">Sarah Chen</span>
              </div>
              <div className="text-emerald-400 text-sm font-medium mt-3">Est. impact: $18,000/mo retainer</div>
              <div className="flex gap-3 mt-4">
                <button className="bg-[#C9A84C] text-[#0D1117] font-semibold px-4 py-2 rounded-lg hover:bg-[#C9A84C]/90">Execute</button>
                <button className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:border-gray-400">Dismiss</button>
                <button onClick={() => setShowEvidence(true)} className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:border-[#C9A84C]">View evidence chain</button>
              </div>
            </div>

            {/* Client Health */}
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">CLIENT HEALTH</h3>
              <div className="grid grid-cols-4 gap-3">
                {CLIENTS.map(c => (
                  <div key={c.name} className={`bg-[#111827] rounded-lg p-4 border-l-4 ${c.color} cursor-pointer hover:bg-[#111827]/80 relative`}>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.status}</div>
                    <div className={`absolute top-3 right-3 text-lg font-bold ${c.textColor}`}>{c.score || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity Ranker */}
            <div>
              <h2 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">OPPORTUNITY PIPELINE</h2>
              <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] overflow-hidden">
                <table className="w-full">
                  <thead><tr className="bg-[#0D1117]">
                    {['#','Problem','Tier','Lifecycle','Offer','Prob.','Impact','Score','Action'].map(h => (
                      <th key={h} className="text-[10px] uppercase tracking-wider text-gray-500 px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {OPPORTUNITIES.map(o => (
                      <tr key={o.rank} className="border-t border-[#1e2a3a] hover:bg-[#1e2a3a]/50">
                        <td className="px-4 py-3 text-sm text-gray-500">{o.rank}</td>
                        <td className="px-4 py-3 text-sm font-medium">{o.problem}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full border ${o.tier==='UHNW'?'border-[#C9A84C] text-[#C9A84C]':'border-blue-400 text-blue-400'}`}>{o.tier}</span></td>
                        <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${lifecycleColor[o.lifecycle]}`}>{o.lifecycle}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-300">{o.offer}</td>
                        <td className="px-4 py-3 text-sm">
                          {o.probability}%
                          <div className="w-12 h-1 bg-gray-700 rounded mt-1"><div className="h-full bg-emerald-400 rounded" style={{width:`${o.probability}%`}} /></div>
                        </td>
                        <td className={`px-4 py-3 text-sm ${o.impact>8?'text-red-400':o.impact>6?'text-amber-400':'text-gray-400'}`}>{o.impact}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#C9A84C]">{o.composite}</td>
                        <td className="px-4 py-3"><span className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer">{o.action}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wealth Events */}
            <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
              <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">WEALTH EVENTS</h3>
              {EVENTS.map((e,i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-[#1e2a3a] last:border-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${e.dot}`} />
                  <div className="flex-1">
                    <div className="text-sm text-gray-300">{e.text}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{e.time}</div>
                  </div>
                  <span className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer whitespace-nowrap">Brief →</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column (320px) ─────────────────── */}
          <div className="w-[320px] flex-shrink-0 space-y-4">

            {/* Daily Brief */}
            <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
              <div className="text-sm font-medium text-gray-300 mb-3">Fri, Apr 3, 2026</div>
              <div className="text-[10px] uppercase text-gray-500 mb-2">CHANGES SINCE YESTERDAY</div>
              {CHANGES.map((c,i) => <div key={i} className="text-sm text-gray-300 py-1 flex gap-2"><span className="text-gray-600 mt-1.5">•</span>{c}</div>)}
              <div className="text-[10px] uppercase text-gray-500 mt-4 mb-2">ALERTS</div>
              {ALERTS.map((a,i) => (
                <div key={i} className={`border-l-2 pl-3 py-2 mb-2 text-sm ${a.sev==='critical'?'border-red-500 text-red-300':'border-amber-500 text-amber-300'}`}>{a.msg}</div>
              ))}
              <div className="text-[10px] uppercase text-gray-500 mt-4 mb-2">RECOMMENDED ACTIONS</div>
              {['Review Wellington Trust health decline','Generate intel brief for Marcus Reid','Update Evidence Graph with FBI alert','Schedule quarterly review with Sarah Chen'].map((a,i) => (
                <div key={i} className="flex items-center gap-2 py-1 cursor-pointer" onClick={() => toggleAction(i)}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${checkedActions.has(i)?'bg-[#C9A84C] border-[#C9A84C] text-[#0D1117]':'border-gray-600'}`}>{checkedActions.has(i)?'✓':''}</div>
                  <span className={`text-sm ${checkedActions.has(i)?'line-through text-gray-600':'text-gray-300'}`}>{a}</span>
                  <span className={`text-[10px] px-1.5 rounded ml-auto ${i<2?'bg-red-900/50 text-red-400':'bg-amber-900/50 text-amber-400'}`}>{i<2?'critical':'high'}</span>
                </div>
              ))}
            </div>

            {/* Agent Status */}
            <div>
              <div className="flex justify-between mb-3"><span className="text-[11px] tracking-widest text-gray-400 uppercase font-semibold">AI AGENTS</span><Link href="/admin/runtime" className="text-[11px] text-[#C9A84C] hover:underline">Manage →</Link></div>
              <div className="grid grid-cols-2 gap-2">
                {AGENTS.map(a => (
                  <div key={a.name} className="bg-[#0D1117] rounded-lg p-3 flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDot[a.status]}`} />
                    <div>
                      <div className="text-xs font-medium">{a.name}</div>
                      <div className="text-[10px] text-gray-500">{a.last}</div>
                      {a.status==='error' && <div className="text-[10px] text-red-400">Rate limit exceeded</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Queue */}
            <div className="bg-[#111827] rounded-lg border border-[#1e2a3a]">
              <div className="px-4 pt-3 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500">RISK REVIEW QUEUE</span>
                <span className="bg-red-900/50 text-red-400 text-[10px] px-1.5 rounded-full">{RISKS.length}</span>
              </div>
              {RISKS.map((r,i) => (
                <div key={i} className={`p-4 border-b border-[#1e2a3a] last:border-0 border-l-4 ${r.severity==='critical'?'border-l-red-500':'border-l-amber-500'}`}>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{r.desc}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-gray-500">{r.module}</span>
                    <span className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer">Review now →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Integration Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4 cursor-pointer hover:border-[#1e2a3a]/80">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-sm font-medium text-purple-400">VoiceForge</span></div>
                <div className="text-[11px] text-gray-500 mt-1">6 modules active</div>
              </div>
              <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4 cursor-pointer hover:border-[#1e2a3a]/80">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-sm font-medium text-teal-400">VisionAudioForge</span></div>
                <div className="text-[11px] text-gray-500 mt-1">8 modules active</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">QUICK ACTIONS</h3>
              <div className="grid grid-cols-2 gap-2">
                {[{label:'Discover Problem',href:'/discover'},{label:'Build Offer',href:'/build/offer/new'},{label:'Add Client',href:'/clients/new'},{label:'Launch Playbook',href:'/build/playbooks'}].map(a => (
                  <button key={a.label} onClick={() => router.push(a.href)} className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3 text-center hover:border-[#C9A84C]/40 transition">
                    <div className="text-xs text-gray-400 hover:text-white">{a.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Evidence Drawer ───────────────────────────── */}
      {showEvidence && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowEvidence(false)} />
          <div className="fixed right-0 top-0 h-full w-[420px] bg-[#111827] border-l border-[#1e2a3a] z-50 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Evidence Chain</h2>
              <button onClick={() => setShowEvidence(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            {[
              { source: 'FBI Alert IC3-2025-PSA', type: 'regulatory', cred: 9.2, claim: 'AI-enabled voice cloning used in targeted phishing against HNW individuals' },
              { source: 'Deloitte FO Cybersecurity Report 2024', type: 'industry', cred: 8.7, claim: '68% of family offices lack formal incident response plans' },
              { source: 'Client Incident Log', type: 'internal', cred: 10, claim: 'CFO received deepfake voice call attempting $2.3M wire transfer' },
            ].map((e,i) => (
              <div key={i} className="border-l-2 border-[#C9A84C] pl-4 mb-6">
                <div className="text-sm font-medium">{e.source} <span className={`text-[10px] px-2 py-0.5 rounded-full ml-2 ${e.type==='regulatory'?'bg-red-900/50 text-red-400':e.type==='industry'?'bg-blue-900/50 text-blue-400':'bg-emerald-900/50 text-emerald-400'}`}>{e.type}</span></div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full"><div className="h-full bg-emerald-400 rounded-full" style={{width:`${e.cred*10}%`}} /></div>
                  <span className="text-[10px] text-gray-500">{e.cred}/10</span>
                </div>
                <div className="text-sm text-gray-400 italic mt-2">{e.claim}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
