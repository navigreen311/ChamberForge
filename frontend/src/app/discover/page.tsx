'use client'

import { useState } from 'react'
import ProblemOfferDrawer from '@/app/components/discover/ProblemOfferDrawer'

// ─── Inline Data ──────────────────────────────────────────────
const KPIS = [
  { label: 'PROBLEMS FOUND', value: '47' },
  { label: 'EVIDENCE SOURCES', value: '23' },
  { label: 'HIGH URGENCY', value: '8' },
  { label: 'AVG CREDIBILITY', value: '7.8' },
  { label: 'STALE EVIDENCE', value: '3' },
]

const WEALTH_TIERS = ['UHNW', 'HNW', 'Family Office', 'Dynasty'] as const
const LIFECYCLE_STAGES = ['Emerging', 'Accelerating', 'Proven', 'Saturated', 'Declining'] as const
const PAIN_CATEGORIES = ['All Categories', 'Security', 'Coordination', 'Privacy', 'Governance', 'Medical', 'Legal', 'Financial'] as const
const URGENCY_OPTIONS = ['Any Urgency', '9+', '8+', '7+', '6+', '5+'] as const
const SORT_OPTIONS = ['Composite Score', 'Urgency', 'Newest'] as const

interface Problem {
  id: number
  title: string
  category: string
  tier: string
  lifecycle: string
  urgency: number
  credibility: number
  composite: number
  wtpRange: string
  citations: number
  timestamp: string
  wtpSignal: number
  offerId: string
  offerTeaser: { name: string; price: string }
  competitorCount: number
  timeToFirstClient: string
}

const PROBLEMS: Problem[] = [
  {
    id: 1,
    title: 'AI Voice Cloning Wire Fraud Targeting Family Offices',
    category: 'Security',
    tier: 'UHNW',
    lifecycle: 'Emerging',
    urgency: 9.2,
    credibility: 8.7,
    composite: 8.9,
    wtpRange: '$10-25K/mo',
    citations: 7,
    timestamp: '2h ago',
    wtpSignal: 8.4,
    offerId: 'family-cyber-command', problemSlug: 'ai-voice-fraud',
    offerTeaser: { name: 'Family Cybersecurity & Identity Command Center', price: '$10-25K/mo' },
    competitorCount: 3, timeToFirstClient: '4-8 wks',
  },
  {
    id: 2,
    title: 'Coordination Overload for Post-Exit Tech Founders',
    category: 'Coordination',
    tier: 'HNW',
    lifecycle: 'Accelerating',
    urgency: 8.1,
    credibility: 7.9,
    composite: 7.4,
    wtpRange: '$15-30K/mo',
    citations: 5,
    timestamp: '4h ago',
    wtpSignal: 7.2,
    offerId: 'private-ops-office', problemSlug: 'coordination-overload',
    offerTeaser: { name: 'Private Operations Office', price: '$15-30K/mo' },
    competitorCount: 5, timeToFirstClient: '6-10 wks',
  },
  {
    id: 3,
    title: 'Data Broker Exposure of High-Profile Families',
    category: 'Privacy',
    tier: 'UHNW',
    lifecycle: 'Proven',
    urgency: 7.5,
    credibility: 8.2,
    composite: 7.1,
    wtpRange: '$8-18K/mo',
    citations: 8,
    timestamp: '6h ago',
    wtpSignal: 6.8,
    offerId: 'footprint-reduction', problemSlug: 'data-broker-exposure',
    offerTeaser: { name: 'Private Footprint Reduction Program', price: '$8-18K/mo' },
    competitorCount: 8, timeToFirstClient: '3-6 wks',
  },
  {
    id: 4,
    title: 'Non-Investment Risk Governance Gaps',
    category: 'Governance',
    tier: 'Family Office',
    lifecycle: 'Accelerating',
    urgency: 7.8,
    credibility: 7.1,
    composite: 6.8,
    wtpRange: '$15-35K/qtr',
    citations: 4,
    timestamp: '1d ago',
    wtpSignal: 6.2,
    offerId: 'family-risk-council', problemSlug: 'non-investment-risk',
    offerTeaser: { name: 'Family Risk Council', price: '$15-35K/qtr' },
    competitorCount: 6, timeToFirstClient: '8-12 wks',
  },
  {
    id: 5,
    title: 'Healthcare Navigation Fragmentation',
    category: 'Medical',
    tier: 'HNW',
    lifecycle: 'Emerging',
    urgency: 6.9,
    credibility: 6.5,
    composite: 5.8,
    wtpRange: '$8-20K/mo',
    citations: 3,
    timestamp: '1d ago',
    wtpSignal: 5.5,
    offerId: 'medical-navigation', problemSlug: 'healthcare-navigation',
    offerTeaser: { name: 'Medical Navigation & Longevity Desk', price: '$8-20K/mo' },
    competitorCount: 4, timeToFirstClient: '4-6 wks',
  },
]

const TRENDS = [
  { label: 'AI-based social engineering', direction: '↑', color: 'bg-red-400' },
  { label: 'Post-exit coordination', direction: '↑', color: 'bg-amber-400' },
  { label: 'Data broker regulation', direction: '→', color: 'bg-blue-400' },
  { label: 'Family governance tech', direction: '↑', color: 'bg-emerald-400' },
  { label: 'Concierge medicine shift', direction: '↑', color: 'bg-purple-400' },
  { label: 'Insurance hardening', direction: '↓', color: 'bg-gray-400' },
]

const LIFECYCLE_COUNTS = [
  { stage: 'Emerging', count: 14, color: 'bg-blue-500' },
  { stage: 'Accelerating', count: 11, color: 'bg-emerald-500' },
  { stage: 'Proven', count: 9, color: 'bg-amber-500' },
  { stage: 'Saturated', count: 8, color: 'bg-orange-500' },
  { stage: 'Declining', count: 5, color: 'bg-red-500' },
]

const EVIDENCE_OPS = [
  { key: 'Sources connected', value: '23' },
  { key: 'Claims extracted', value: '142' },
  { key: 'Contradictions', value: '6' },
  { key: 'Stale evidence', value: '3' },
]

const SCAN_HISTORY = [
  { label: 'Full ecosystem scan', time: '2h ago', status: 'complete' },
  { label: 'Security vertical deep dive', time: '6h ago', status: 'complete' },
  { label: 'New source ingestion', time: '1d ago', status: 'complete' },
  { label: 'Contradiction resolution', time: '2d ago', status: 'warning' },
]

const SOURCE_PILLS = ['SEC Filings', 'Expert Interviews', 'Industry Reports', 'HNW Forums', 'News']

const EVIDENCE_DRAWER_DATA = [
  {
    source: 'FBI IC3 Annual Report 2025',
    type: 'Government',
    credibility: 9.4,
    claims: [
      'AI voice cloning attacks against family offices up 340% YoY',
      'Average wire fraud loss per incident: $2.3M',
    ],
  },
  {
    source: 'Campden Wealth Family Office Survey',
    type: 'Industry Report',
    credibility: 8.1,
    claims: [
      '67% of family offices report attempted social engineering',
      'Only 12% have AI-specific fraud prevention protocols',
    ],
  },
  {
    source: 'Expert Interview — CISO, $4B SFO',
    type: 'Primary',
    credibility: 7.8,
    claims: [
      'Current voice verification systems fail against latest deepfakes',
      'Budget allocation for AI security expected to triple in 18 months',
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────
function tierColor(tier: string) {
  if (tier === 'UHNW') return 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/40'
  if (tier === 'HNW') return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
}

function lifecycleColor(lc: string) {
  const map: Record<string, string> = {
    Emerging: 'bg-blue-500/20 text-blue-400',
    Accelerating: 'bg-emerald-500/20 text-emerald-400',
    Proven: 'bg-amber-500/20 text-amber-400',
    Saturated: 'bg-orange-500/20 text-orange-400',
    Declining: 'bg-red-500/20 text-red-400',
  }
  return map[lc] || 'bg-gray-500/20 text-gray-400'
}

function barColor(value: number, type: 'cred' | 'urgency' | 'wtp') {
  if (type === 'urgency') return value >= 8 ? 'bg-red-500' : value >= 6 ? 'bg-amber-500' : 'bg-green-500'
  if (type === 'cred') return value >= 8 ? 'bg-emerald-500' : value >= 6 ? 'bg-amber-500' : 'bg-red-500'
  return 'bg-[#C9A84C]'
}

function competitionBadge(count: number) {
  if (count <= 2) return { label: 'Blue ocean', cls: 'bg-emerald-500/20 text-emerald-400' }
  if (count <= 6) return { label: 'Low competition', cls: 'bg-blue-500/20 text-blue-400' }
  return { label: 'Competitive', cls: 'bg-amber-500/20 text-amber-400' }
}

function statusBadge(s: string) {
  if (s === 'complete') return 'bg-emerald-500/20 text-emerald-400'
  return 'bg-amber-500/20 text-amber-400'
}

// ─── Page ─────────────────────────────────────────────────────
export default function DiscoverPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<string>('Composite Score')
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [selectedTiers, setSelectedTiers] = useState<Set<string>>(new Set())
  const [selectedLifecycles, setSelectedLifecycles] = useState<Set<string>>(new Set())
  const [painCategory, setPainCategory] = useState('All Categories')
  const [urgencyFilter, setUrgencyFilter] = useState('Any Urgency')
  const [drawerProblemId, setDrawerProblemId] = useState<number | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [savedProblems, setSavedProblems] = useState<Set<number>>(new Set())

  const toggleTier = (t: string) => {
    const next = new Set(selectedTiers)
    next.has(t) ? next.delete(t) : next.add(t)
    setSelectedTiers(next)
  }

  const toggleLifecycle = (l: string) => {
    const next = new Set(selectedLifecycles)
    next.has(l) ? next.delete(l) : next.add(l)
    setSelectedLifecycles(next)
  }

  const clearAll = () => {
    setSelectedTiers(new Set())
    setSelectedLifecycles(new Set())
    setPainCategory('All Categories')
    setUrgencyFilter('Any Urgency')
    setSearch('')
  }

  // Filter problems
  const filtered = PROBLEMS.filter((p) => {
    if (selectedTiers.size > 0 && !selectedTiers.has(p.tier)) return false
    if (selectedLifecycles.size > 0 && !selectedLifecycles.has(p.lifecycle)) return false
    if (painCategory !== 'All Categories' && p.category !== painCategory) return false
    if (urgencyFilter !== 'Any Urgency') {
      const min = parseFloat(urgencyFilter.replace('+', ''))
      if (p.urgency < min) return false
    }
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Urgency') return b.urgency - a.urgency
    if (sort === 'Newest') return a.id - b.id
    return b.composite - a.composite
  })

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-100">
      {/* ── Page Header ── */}
      <div className="border-b border-[#1e2a3a] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Problem Discovery</h1>
            <p className="mt-1 text-sm text-gray-400">
              Identify, validate, and prioritize high-value problems across wealth tiers
            </p>
          </div>
          <button onClick={() => alert('AI Scan started — discovering problems from 23 evidence sources...')} className="rounded-lg bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#d4b85d] transition-colors">
            ▶ Run AI Scan
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="border-b border-[#1e2a3a] px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-lg border border-[#1e2a3a] bg-[#111827] px-4 py-3 text-center">
              <div className="text-xs font-medium tracking-wider text-gray-500">{k.label}</div>
              <div className="mt-1 text-2xl font-bold text-white">{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scan Status Bar ── */}
      <div className="border-b border-[#1e2a3a] px-6 py-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-gray-400">
              Idle · Last scan: 2h ago · 47 problems · Evidence Ops active
            </span>
          </span>
          <div className="flex gap-2 ml-auto">
            {SOURCE_PILLS.map((s) => (
              <span key={s} className="rounded-full border border-[#1e2a3a] bg-[#111827] px-3 py-0.5 text-xs text-gray-400">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3-Column Layout ── */}
      <div className="flex">
        {/* ── LEFT: Filter Panel ── */}
        <aside className="w-[260px] shrink-0 border-r border-[#1e2a3a] p-4 space-y-5">
          {/* Wealth Tier */}
          <div>
            <div className="mb-2 text-xs font-medium tracking-wider text-gray-500">WEALTH TIER</div>
            <div className="flex flex-wrap gap-2">
              {WEALTH_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTier(t)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTiers.has(t)
                      ? 'border-[#C9A84C] bg-[#C9A84C]/20 text-[#C9A84C]'
                      : 'border-[#1e2a3a] bg-[#111827] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Pain Category */}
          <div>
            <div className="mb-2 text-xs font-medium tracking-wider text-gray-500">PAIN CATEGORY</div>
            <select
              value={painCategory}
              onChange={(e) => setPainCategory(e.target.value)}
              className="w-full rounded-lg border border-[#1e2a3a] bg-[#111827] px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#C9A84C]"
            >
              {PAIN_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Lifecycle Stage */}
          <div>
            <div className="mb-2 text-xs font-medium tracking-wider text-gray-500">LIFECYCLE STAGE</div>
            <div className="flex flex-wrap gap-2">
              {LIFECYCLE_STAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLifecycle(l)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedLifecycles.has(l)
                      ? 'border-[#C9A84C] bg-[#C9A84C]/20 text-[#C9A84C]'
                      : 'border-[#1e2a3a] bg-[#111827] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Score */}
          <div>
            <div className="mb-2 text-xs font-medium tracking-wider text-gray-500">URGENCY SCORE</div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full rounded-lg border border-[#1e2a3a] bg-[#111827] px-3 py-2 text-sm text-gray-300 outline-none focus:border-[#C9A84C]"
            >
              {URGENCY_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Clear All */}
          <button
            onClick={clearAll}
            className="w-full rounded-lg border border-[#1e2a3a] bg-[#111827] py-2 text-xs font-medium text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          >
            Clear All Filters
          </button>
        </aside>

        {/* ── CENTER: Search + Problem Cards ── */}
        <main className="flex-1 p-5 space-y-4 overflow-auto">
          {/* Search bar + controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#1e2a3a] bg-[#111827] py-2.5 pl-10 pr-4 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-[#C9A84C]"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-[#1e2a3a] bg-[#111827] px-3 py-2.5 text-sm text-gray-300 outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="flex rounded-lg border border-[#1e2a3a] overflow-hidden">
              <button
                onClick={() => setView('cards')}
                className={`px-3 py-2 text-xs font-medium ${view === 'cards' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#111827] text-gray-500'}`}
              >
                Cards
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-3 py-2 text-xs font-medium ${view === 'table' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#111827] text-gray-500'}`}
              >
                Table
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Showing {sorted.length} of 47 problems
          </div>

          {/* Problem Cards */}
          <div className="space-y-3">
            {sorted.map((p) => (
              <div key={p.id} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 hover:border-[#C9A84C]/40 cursor-pointer transition-colors">
                {/* Title row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white leading-tight">{p.title}</h3>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">{p.category}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tierColor(p.tier)}`}>
                        {p.tier}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${lifecycleColor(p.lifecycle)}`}>
                        {p.lifecycle}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${competitionBadge(p.competitorCount).cls}`}>
                        {competitionBadge(p.competitorCount).label}
                      </span>
                      <span className="rounded-full bg-gray-500/20 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                        First client: {p.timeToFirstClient}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <div className="text-2xl font-bold text-[#C9A84C]">{p.composite}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Composite</div>
                  </div>
                </div>

                {/* Evidence bars */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Credibility', value: p.credibility, type: 'cred' as const },
                    { label: 'Urgency', value: p.urgency, type: 'urgency' as const },
                    { label: 'WTP Signal', value: p.wtpSignal, type: 'wtp' as const },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-500">{bar.label}</span>
                        <span className="text-[10px] font-medium text-gray-300">{bar.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1e2a3a] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor(bar.value, bar.type)}`}
                          style={{ width: `${(bar.value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meta + actions */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span>WTP: {p.wtpRange}</span>
                    <span>{p.citations} citations</span>
                    <span>{p.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedProblem(p.problemSlug); setDrawerOpen(true) }}
                      className="rounded-lg bg-[#C9A84C] px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-[#d4b85d] transition-colors"
                    >
                      Build offer →
                    </button>
                    <button
                      onClick={() => setDrawerProblemId(drawerProblemId === p.id ? null : p.id)}
                      className="rounded-lg border border-[#C9A84C]/40 px-3 py-1.5 text-[11px] font-medium text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
                    >
                      View evidence
                    </button>
                    <button onClick={() => { setSelectedProblem(p.problemSlug); setDrawerOpen(true) }} className="rounded-lg border border-[#1e2a3a] px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
                      Validate
                    </button>
                  </div>
                </div>

                {/* Offer Teaser + PRIMARY CTA */}
                <div className="mt-3 pt-3 border-t border-[#1e2a3a]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">What you'd sell:</div>
                      <div className="text-sm font-medium text-white">{p.offerTeaser.name}</div>
                    </div>
                    <div className="text-sm text-emerald-400 font-semibold">{p.offerTeaser.price}</div>
                  </div>
                  <button
                    onClick={() => { setSelectedProblem(p.problemSlug); setDrawerOpen(true) }}
                    className="w-full py-2.5 bg-[#C9A84C] text-[#0D1117] font-semibold text-[13px] rounded-lg hover:bg-[#B8973B] transition-colors flex items-center justify-center gap-2"
                  >
                    See the full opportunity <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* ── RIGHT: Sidebar Panels ── */}
        <aside className="w-[280px] shrink-0 border-l border-[#1e2a3a] p-4 space-y-5 overflow-auto">
          {/* Trend Radar */}
          <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-gray-500">TREND RADAR</h3>
            <div className="space-y-2.5">
              {TRENDS.map((t) => (
                <div key={t.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${t.color}`} />
                  <span className="flex-1 text-xs text-gray-300 truncate">{t.label}</span>
                  <span className="text-sm text-gray-500">{t.direction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lifecycle Radar */}
          <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-gray-500">LIFECYCLE RADAR</h3>
            <div className="space-y-2.5">
              {LIFECYCLE_COUNTS.map((l) => (
                <div key={l.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-400">{l.stage}</span>
                    <span className="text-[11px] font-medium text-gray-300">{l.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#1e2a3a] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${l.color}`}
                      style={{ width: `${(l.count / 15) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Ops Status */}
          <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-gray-500">EVIDENCE OPS STATUS</h3>
            <div className="space-y-2">
              {EVIDENCE_OPS.map((e) => (
                <div key={e.key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{e.key}</span>
                  <span className="text-xs font-medium text-gray-200">{e.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scan History */}
          <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-medium tracking-wider text-gray-500">SCAN HISTORY</h3>
            <div className="space-y-2.5">
              {SCAN_HISTORY.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-300 truncate">{s.label}</div>
                    <div className="text-[10px] text-gray-500">{s.time}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(s.status)}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Evidence Chain Drawer ── */}
      {drawerProblemId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerProblemId(null)}
          />
          {/* Drawer */}
          <div className="relative w-[480px] h-full bg-[#0D1117] border-l border-[#1e2a3a] overflow-auto animate-slide-in">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Evidence Chain</h2>
                <button
                  onClick={() => setDrawerProblemId(null)}
                  className="text-gray-500 hover:text-white text-xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Problem context */}
              <div className="mb-5 rounded-lg border border-[#1e2a3a] bg-[#111827] p-3">
                <div className="text-sm font-medium text-white">
                  {PROBLEMS.find((p) => p.id === drawerProblemId)?.title}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {PROBLEMS.find((p) => p.id === drawerProblemId)?.citations} evidence sources analyzed
                </div>
              </div>

              {/* Evidence sources */}
              <div className="space-y-4">
                {EVIDENCE_DRAWER_DATA.map((e, i) => (
                  <div key={i} className="rounded-lg border border-[#1e2a3a] bg-[#111827] p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-white">{e.source}</div>
                        <span className="mt-1 inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                          {e.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">{e.credibility}</div>
                        <div className="text-[10px] text-gray-500">Credibility</div>
                      </div>
                    </div>

                    {/* Credibility bar */}
                    <div className="mb-3">
                      <div className="h-1.5 rounded-full bg-[#1e2a3a] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor(e.credibility, 'cred')}`}
                          style={{ width: `${(e.credibility / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Claims */}
                    <div className="space-y-1.5">
                      {e.claims.map((c, ci) => (
                        <div key={ci} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A84C]" />
                          <span className="text-xs text-gray-300 leading-relaxed">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer slide animation */}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>

      {drawerOpen && selectedProblem && (
        <ProblemOfferDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} problemId={selectedProblem} />
      )}
    </div>
  )
}
