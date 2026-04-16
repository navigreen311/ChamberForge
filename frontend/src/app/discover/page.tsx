'use client'

import { useState, useEffect, useCallback } from 'react'
import ProblemOfferDrawer from '@/app/components/discover/ProblemOfferDrawer'
import ScanSchedule from '@/app/components/discover/ScanSchedule'

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
  id: string
  title: string
  description: string
  wealth_tier: string
  pain_category: string
  lifecycle_stage: string
  urgency_score: number
  credibility_score: number
  wtp_signal: string
  composite_score: number
  wtp_range: string
  citation_count: number
  buyer_type: string
  compliance_risk: string
  trust_channel: string
  source_types: string[]
  created_at: string
  is_new: boolean
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

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

const SCAN_SCHEDULE = {
  nextScan: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  nextScanType: 'Daily',
  schedules: [
    { scanType: 'Regulatory alerts', frequency: 'Real-time', sourcesChecked: 'FBI, FTC, SEC', lastRun: 'Live' },
    { scanType: 'Daily scan', frequency: 'Every day 8 AM', sourcesChecked: 'All 13 sources', lastRun: 'Today 8:00 AM' },
    { scanType: 'Weekly deep scan', frequency: 'Every Monday', sourcesChecked: 'All sources + new reports', lastRun: 'Mon, Mar 31' },
    { scanType: 'Monthly re-score', frequency: '1st of month', sourcesChecked: 'Full problem library', lastRun: 'Apr 1' },
  ],
}

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
  if (tier.includes('UHNW')) return 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/40'
  if (tier.includes('HNW')) return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
}

function tierShort(tier: string) {
  if (tier.includes('UHNW')) return 'UHNW'
  if (tier.includes('HNW')) return 'HNW'
  return tier
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

function statusBadge(s: string) {
  if (s === 'complete') return 'bg-emerald-500/20 text-emerald-400'
  return 'bg-amber-500/20 text-amber-400'
}

function wtpSignalNumeric(signal: string): number {
  const map: Record<string, number> = { 'Very High': 9.0, 'High': 7.5, 'Medium': 5.5, 'Low': 3.5 }
  return map[signal] || 5.0
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
  const [drawerProblemId, setDrawerProblemId] = useState<string | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, sort, selectedTiers, selectedLifecycles, painCategory, urgencyFilter])

  // Fetch problems from API
  const fetchProblems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/discover/problems?page=${page}&limit=${limit}`)
      const data = await res.json()
      setProblems(data.problems)
      setPagination(data.pagination)
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

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

  // Client-side filter (applied to current page of data)
  const filtered = problems.filter((p) => {
    if (selectedTiers.size > 0 && !selectedTiers.has(tierShort(p.wealth_tier))) return false
    if (selectedLifecycles.size > 0 && !selectedLifecycles.has(p.lifecycle_stage)) return false
    if (painCategory !== 'All Categories' && !p.pain_category.toLowerCase().includes(painCategory.toLowerCase())) return false
    if (urgencyFilter !== 'Any Urgency') {
      const min = parseFloat(urgencyFilter.replace('+', ''))
      if (p.urgency_score < min) return false
    }
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Urgency') return b.urgency_score - a.urgency_score
    if (sort === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return b.composite_score - a.composite_score
  })

  // Pagination display helpers
  const showingStart = pagination ? (page - 1) * limit + 1 : 0
  const showingEnd = pagination ? Math.min(page * limit, pagination.total) : 0

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
              Idle · Last scan: 2h ago · {pagination?.total ?? 47} problems · Evidence Ops active
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

          {pagination && (
            <div className="text-xs text-gray-500">
              Showing {showingStart}–{showingEnd} of {pagination.total} problems
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
            </div>
          )}

          {/* Problem Cards */}
          {!loading && (
            <div className="space-y-3">
              {sorted.map((p) => (
                <div key={p.id} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 hover:border-[#C9A84C]/40 cursor-pointer transition-colors">
                  {/* Title row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white leading-tight">{p.title}</h3>
                        {p.is_new && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">New</span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500">{p.pain_category}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tierColor(p.wealth_tier)}`}>
                          {tierShort(p.wealth_tier)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${lifecycleColor(p.lifecycle_stage)}`}>
                          {p.lifecycle_stage}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${p.compliance_risk === 'Critical' ? 'bg-red-500/20 text-red-400' : p.compliance_risk === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {p.compliance_risk} risk
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <div className="text-2xl font-bold text-[#C9A84C]">{p.composite_score}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider cursor-help" title="Overall opportunity score combining credibility, urgency, and payment likelihood">Composite</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-2">{p.description}</p>

                  {/* Evidence bars */}
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Credibility', value: p.credibility_score, type: 'cred' as const, tip: 'How solid our research is — 10 = government/academic source, 1 = blog post' },
                      { label: 'Urgency', value: p.urgency_score, type: 'urgency' as const, tip: 'How fast this problem is growing and how urgently wealthy people need it solved' },
                      { label: 'WTP Signal', value: wtpSignalNumeric(p.wtp_signal), type: 'wtp' as const, tip: 'Willingness To Pay — how likely wealthy clients are to pay premium prices to solve this' },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500 cursor-help" title={bar.tip}>{bar.label}</span>
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
                      <span>WTP: {p.wtp_range}</span>
                      <span>{p.citation_count} citations</span>
                      <span>{p.buyer_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedProblem(p.id); setDrawerOpen(true) }}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination Controls ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="hidden md:flex items-center justify-between mt-6 pt-4 border-t border-[#1e2a3a]">
              {/* Left: result count */}
              <span className="text-[11px] text-[#4a5568]">
                Showing {showingStart}–{showingEnd} of {pagination.total} problems
              </span>

              {/* Center: page buttons */}
              <div className="flex items-center gap-1">
                {/* Previous button */}
                <button
                  onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0) }}
                  disabled={!pagination.hasPrev}
                  className={`px-3 py-1.5 rounded-md text-[11px] border transition ${
                    pagination.hasPrev
                      ? 'border-[#2a3a4a] text-[#8892a4] hover:border-[#C9A84C] hover:text-[#C9A84C]'
                      : 'border-[#1e2a3a] text-[#2a3a4a] cursor-not-allowed'
                  }`}
                >
                  ← Previous
                </button>

                {/* Page number pills */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc: (number | string)[], p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={`ellipsis-${i}`} className="px-2 text-[#4a5568] text-[11px]">...</span>
                      : (
                        <button
                          key={`page-${p}`}
                          onClick={() => { setPage(p as number); window.scrollTo(0, 0) }}
                          className={`w-8 h-8 rounded-md text-[11px] font-medium transition ${
                            p === page
                              ? 'bg-[#C9A84C] text-[#0D1117]'
                              : 'border border-[#2a3a4a] text-[#8892a4] hover:border-[#C9A84C] hover:text-[#C9A84C]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                  )
                }

                {/* Next button */}
                <button
                  onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0) }}
                  disabled={!pagination.hasNext}
                  className={`px-3 py-1.5 rounded-md text-[11px] border transition ${
                    pagination.hasNext
                      ? 'border-[#2a3a4a] text-[#8892a4] hover:border-[#C9A84C] hover:text-[#C9A84C]'
                      : 'border-[#1e2a3a] text-[#2a3a4a] cursor-not-allowed'
                  }`}
                >
                  Next →
                </button>
              </div>

              {/* Right: per-page selector */}
              <select
                value={limit}
                onChange={e => { setLimit(parseInt(e.target.value)); setPage(1) }}
                className="bg-[#111827] border border-[#2a3a4a] text-[#8892a4] rounded-md px-2 py-1.5 text-[11px]"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
          )}

          {/* ── Mobile: Load More Button ── */}
          {pagination && pagination.hasNext && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="md:hidden w-full mt-4 py-3 border border-[#2a3a4a] text-[#8892a4] rounded-lg text-[12px] hover:border-[#C9A84C] hover:text-[#C9A84C] transition"
            >
              Load more problems ({pagination.total - page * limit} remaining)
            </button>
          )}
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

          {/* Scan Schedule */}
          <ScanSchedule
            nextScan={SCAN_SCHEDULE.nextScan}
            nextScanType={SCAN_SCHEDULE.nextScanType}
            schedules={SCAN_SCHEDULE.schedules}
          />
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
                  {problems.find((p) => p.id === drawerProblemId)?.title}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {problems.find((p) => p.id === drawerProblemId)?.citation_count} evidence sources analyzed
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
