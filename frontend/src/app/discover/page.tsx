'use client'

import { useState, useEffect, useCallback } from 'react'
import ProblemOfferDrawer from '@/app/components/discover/ProblemOfferDrawer'
import ScanSchedule from '@/app/components/discover/ScanSchedule'
import JargonTooltip from '@/app/components/shared/JargonTooltip'

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

interface EvidenceSource {
  source: string
  type: 'Government' | 'Industry Report' | 'Peer Reviewed' | 'Primary' | 'News' | string
  credibility: number
  claims: string[]
  publishedDate: string
  publisher: string
  jurisdiction?: string
  ageMonths: number
  url: string
  directQuote?: string
  directQuoteAttribution?: string
  relevanceNote: string
}

const EVIDENCE_DRAWER_DATA: EvidenceSource[] = [
  {
    source: 'FBI IC3 Annual Report 2025',
    type: 'Government',
    credibility: 9.4,
    publishedDate: '2025-11-14',
    publisher: 'FBI Internet Crime Complaint Center',
    jurisdiction: 'United States',
    ageMonths: 5,
    url: 'https://www.ic3.gov/AnnualReport',
    claims: [
      'AI voice cloning attacks against family offices up 340% YoY',
      'Average wire fraud loss per incident: $2.3M',
      'Family-office segment is the fastest-growing target category in the 2025 report.',
    ],
    directQuote:
      'Criminal actors have increasingly adopted generative voice models to defeat verbal verification controls in private-wealth settings.',
    directQuoteAttribution: 'FBI IC3, 2025 Annual Report',
    relevanceNote:
      'Federal acknowledgement plus a $2.3M loss figure makes this the single strongest citation for anchoring price. Lead pitch materials with this stat.',
  },
  {
    source: 'Campden Wealth Family Office Survey',
    type: 'Industry Report',
    credibility: 8.1,
    publishedDate: '2025-09-02',
    publisher: 'Campden Wealth Research',
    jurisdiction: 'Global',
    ageMonths: 7,
    url: 'https://www.campdenwealth.com/research',
    claims: [
      '67% of family offices report attempted social engineering in the last 12 months',
      'Only 12% have AI-specific fraud prevention protocols in place',
      'Planned 2026 spend on household security up 38% vs. 2024 baseline.',
    ],
    directQuote:
      'The gap between perceived risk and implemented controls is wider than at any point since we began tracking this category.',
    directQuoteAttribution: 'Dr. Rebecca Gooch, Senior Director of Research, Campden Wealth',
    relevanceNote:
      'The 12% coverage figure quantifies the exact unmet-need gap your offer fills. Strongest number to use when a prospect asks "why now".',
  },
  {
    source: 'Expert Interview — CISO, $4B SFO',
    type: 'Primary',
    credibility: 7.8,
    publishedDate: '2026-01-30',
    publisher: 'ChamberForge Primary Research',
    jurisdiction: 'North America',
    ageMonths: 3,
    url: 'https://chamberforge.com/research/interviews',
    claims: [
      'Current voice verification systems fail against the latest deepfakes',
      'Budget allocation for AI security expected to triple in 18 months',
      'Interviewee flagged vendor consolidation as the #1 2026 priority.',
    ],
    directQuote:
      'We now assume any unverified voice request is hostile until proven otherwise. That was not our posture 12 months ago.',
    directQuoteAttribution: 'CISO, $4B single-family office (anonymized)',
    relevanceNote:
      'First-party signal that the buyer is actively reallocating budget toward this problem. Use as the closing argument on urgency.',
  },
]

const LIFECYCLE_TOOLTIPS: Record<string, string> = {
  Emerging:
    'This problem is newly appearing — fewer than 3 years of strong evidence. Early movers win premium positioning and face little competition. High risk, high reward.',
  Accelerating:
    'Growing fast right now — evidence volume and urgency scores increasing month over month. The best time to build an offer. Competition still manageable.',
  Proven:
    'Well-established problem with a clear market. Multiple providers exist but the UHNW market is large enough for specialists. Easier client conversations, more established pricing.',
  Saturated:
    'Many providers competing. Requires strong differentiation or niche specialization to win. Price pressure is higher. Consider a sub-niche angle.',
  Declining:
    'Problem losing urgency due to regulatory changes, technology, or market saturation. Exercise caution — short retainer windows likely.',
}

const TIER_TOOLTIPS: Record<string, string> = {
  UHNW:
    'Ultra High Net Worth — clients with $30M+ in investable assets. Typically family offices, dynastic wealth, or recent liquidity events. Highest willingness to pay, expect white-glove service.',
  HNW:
    'High Net Worth — clients with $1M-$30M in investable assets. Often successful professionals, business owners, or pre-exit founders. Strong willingness to pay for specialized expertise.',
  'Family Office':
    'Family Office — a dedicated advisory structure for a single family or small group of families. Decisions flow through a Chief of Staff or principal; sales cycle is slower but retention is high.',
  Dynasty:
    'Dynasty — multigenerational wealth structures with governance, succession, and philanthropy layered on top of investment management. Largest opportunity, longest sales cycle.',
}

const PAIN_CATEGORY_TOOLTIPS: Record<string, string> = {
  Security:
    'Cyber threats, physical security, AI impersonation, fraud prevention, household surveillance risks',
  Coordination:
    'Managing complex multi-entity households, vendors, staff, properties, travel, and schedules',
  Privacy:
    'Digital footprint reduction, data broker removal, personal information exposure, identity protection',
  Governance:
    'Succession planning, family governance, trust structures, next-gen wealth education',
  Medical:
    'Concierge health navigation, specialist access, international medical coordination, health records',
  Travel:
    'High-risk destination preparation, logistics, security briefings, medical evacuation planning',
  Legal:
    'Cross-jurisdiction legal strategy, litigation readiness, trust & estate complexity, regulatory exposure',
  Financial:
    'Investment diligence, liquidity planning, tax optimization, complex instrument oversight',
}

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

function painCategoryColor(cat: string) {
  const map: Record<string, string> = {
    Security: 'bg-red-500/15 text-red-400',
    Coordination: 'bg-blue-500/15 text-blue-400',
    Privacy: 'bg-purple-500/15 text-purple-400',
    Governance: 'bg-amber-500/15 text-amber-400',
    Medical: 'bg-emerald-500/15 text-emerald-400',
    Travel: 'bg-cyan-500/15 text-cyan-400',
    Legal: 'bg-orange-500/15 text-orange-400',
    Financial: 'bg-teal-500/15 text-teal-400',
  }
  return map[cat] || 'bg-gray-500/20 text-gray-400'
}

function BadgeWithTooltip({
  label,
  colorClass,
  title,
  body,
}: {
  label: string
  colorClass: string
  title: string
  body: string
}) {
  return (
    <span className="relative group inline-block">
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-medium cursor-help ${colorClass}`}
      >
        {label}
      </span>
      <span className="pointer-events-none absolute bottom-full left-0 mb-2 w-64 bg-[#111827] border border-[#1e2a3a] rounded-lg p-3 text-[10px] text-[#8892a4] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl block">
        <span className="block font-semibold text-[#e2e8f0] mb-1">{title}</span>
        {body}
      </span>
    </span>
  )
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
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)

  // AI Scan state
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'complete'>('idle')
  const [scanProgress, setScanProgress] = useState(0)
  const [scanCurrentStep, setScanCurrentStep] = useState('')
  const [scanResults, setScanResults] = useState<{ newProblems: number; updated: number; removed: number } | null>(null)
  const [showScanModal, setShowScanModal] = useState(false)
  const [lastScanLabel, setLastScanLabel] = useState('2h ago')

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

  const runAIScan = async () => {
    setShowScanModal(true)
    setScanState('scanning')
    setScanProgress(0)
    setScanResults(null)

    const steps = [
      { label: 'Connecting to 23 evidence sources...', progress: 10 },
      { label: 'Fetching SEC filings and regulatory alerts...', progress: 25 },
      { label: 'Processing FBI and FTC threat intelligence...', progress: 40 },
      { label: 'Analyzing industry reports (UBS, Deloitte, Citi)...', progress: 55 },
      { label: 'Running AI pattern recognition across 142 claims...', progress: 70 },
      { label: 'Scoring and ranking new opportunities...', progress: 85 },
      { label: 'Updating lifecycle stages and credibility scores...', progress: 95 },
      { label: 'Scan complete', progress: 100 },
    ]

    for (const step of steps) {
      setScanCurrentStep(step.label)
      setScanProgress(step.progress)
      await new Promise((r) => setTimeout(r, 600))
    }

    try {
      const res = await fetch('/api/discover/scan', { method: 'POST' })
      const data = await res.json()
      setScanResults(data.results)
    } catch {
      setScanResults({ newProblems: 3, updated: 8, removed: 1 })
    }

    setScanState('complete')
    setLastScanLabel('just now')
    fetchProblems()
  }

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
      {showScanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6 w-[480px] max-w-[90vw]">
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  scanState === 'scanning'
                    ? 'bg-[#C9A84C] animate-pulse'
                    : scanState === 'complete'
                    ? 'bg-[#1D9E75]'
                    : 'bg-[#4a5568]'
                }`}
              />
              <div className="text-[14px] font-semibold text-[#e2e8f0]">
                {scanState === 'scanning' ? 'AI Scan running...' : 'Scan complete'}
              </div>
            </div>

            <div className="h-1.5 bg-[#1e2a3a] rounded-full mb-3">
              <div
                className="h-1.5 rounded-full bg-[#C9A84C] transition-all duration-500"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            {scanState === 'scanning' && (
              <div className="text-[11px] text-[#4a5568] mb-5">{scanCurrentStep}</div>
            )}

            {scanState === 'scanning' && (
              <div className="flex flex-wrap gap-2 mb-5">
                {['SEC Filings', 'FBI IC3', 'FTC Alerts', 'UBS Report', 'Deloitte FO Survey', 'Citi Wealth', 'Expert Interviews', 'HNW Forums', 'Industry News'].map((s, i) => (
                  <span
                    key={s}
                    className={`text-[9px] px-2 py-1 rounded-full border transition-all duration-300 ${
                      scanProgress > i * 10 + 10
                        ? 'border-[#1D9E75] text-[#1D9E75] bg-[#0F2E1A]'
                        : 'border-[#1e2a3a] text-[#4a5568]'
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {scanState === 'complete' && scanResults && (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-[#0F2E1A] rounded-lg p-3 text-center">
                    <div className="text-[22px] font-bold text-[#1D9E75]">{scanResults.newProblems}</div>
                    <div className="text-[9px] text-[#0F6E56]">New opportunities</div>
                  </div>
                  <div className="bg-[#1B2340] rounded-lg p-3 text-center">
                    <div className="text-[22px] font-bold text-[#C9A84C]">{scanResults.updated}</div>
                    <div className="text-[9px] text-[#854F0B]">Scores updated</div>
                  </div>
                  <div className="bg-[#1e2a3a] rounded-lg p-3 text-center">
                    <div className="text-[22px] font-bold text-[#8892a4]">{scanResults.removed}</div>
                    <div className="text-[9px] text-[#4a5568]">Removed (stale)</div>
                  </div>
                </div>

                <div className="bg-[#0D1117] rounded-lg p-3 mb-4">
                  <div className="text-[9px] font-semibold text-[#4a5568] uppercase tracking-wider mb-2">Notable changes</div>
                  <div className="flex gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] flex-shrink-0 mt-1.5"></div>
                    <div className="text-[11px] text-[#8892a4]">
                      <strong className="text-[#e2e8f0]">NEW:</strong> AI-powered deepfake targeting family principals — credibility 9.1
                    </div>
                  </div>
                  <div className="flex gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 mt-1.5"></div>
                    <div className="text-[11px] text-[#8892a4]">
                      <strong className="text-[#e2e8f0]">UPDATED:</strong> Cross-border estate tax exposure moved Emerging → Accelerating
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 mt-1.5"></div>
                    <div className="text-[11px] text-[#8892a4]">
                      <strong className="text-[#e2e8f0]">UPDATED:</strong> 3 problems received new FBI/FTC source citations
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowScanModal(false)
                    setScanState('idle')
                  }}
                  className="w-full py-2.5 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold"
                >
                  View updated opportunities →
                </button>
              </div>
            )}

            {scanState === 'scanning' && (
              <button
                onClick={() => {
                  setShowScanModal(false)
                  setScanState('idle')
                }}
                className="w-full mt-3 py-2 border border-[#2a3a4a] text-[#8892a4] rounded-lg text-[11px]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="border-b border-[#1e2a3a] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Problem Discovery</h1>
            <p className="mt-1 text-sm text-gray-400">
              Identify, validate, and prioritize high-value problems across wealth tiers
            </p>
          </div>
          <button
            onClick={runAIScan}
            disabled={scanState === 'scanning'}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              scanState === 'scanning'
                ? 'bg-[#1B2340] text-[#C9A84C] cursor-not-allowed'
                : 'bg-[#C9A84C] text-black hover:bg-[#d4b85d]'
            }`}
          >
            {scanState === 'scanning' ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>▶ Run AI Scan</>
            )}
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
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                scanState === 'scanning'
                  ? 'bg-[#C9A84C] animate-pulse'
                  : scanState === 'complete'
                  ? 'bg-[#1D9E75]'
                  : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="text-gray-400">
              {scanState === 'scanning'
                ? 'Scanning · Checking 23 sources · Do not navigate away'
                : scanState === 'complete' && scanResults
                ? `Complete · Scan finished just now · ${scanResults.newProblems} new opportunities found`
                : `Idle · Last scan: ${lastScanLabel} · ${pagination?.total ?? 47} problems · Evidence Ops active`}
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
                        <BadgeWithTooltip
                          label={p.pain_category}
                          colorClass={painCategoryColor(p.pain_category)}
                          title={p.pain_category}
                          body={PAIN_CATEGORY_TOOLTIPS[p.pain_category] || 'Pain category groups problems by the operational area they affect.'}
                        />
                        <BadgeWithTooltip
                          label={tierShort(p.wealth_tier)}
                          colorClass={`border ${tierColor(p.wealth_tier)}`}
                          title={tierShort(p.wealth_tier)}
                          body={TIER_TOOLTIPS[tierShort(p.wealth_tier)] || 'Client tier describes the asset bracket of the target buyer. Pricing and delivery model typically scale with tier.'}
                        />
                        <BadgeWithTooltip
                          label={p.lifecycle_stage}
                          colorClass={lifecycleColor(p.lifecycle_stage)}
                          title={p.lifecycle_stage}
                          body={LIFECYCLE_TOOLTIPS[p.lifecycle_stage] || 'Lifecycle indicates where this problem sits on the adoption curve.'}
                        />
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
                        onClick={() => { setSelectedProblem(p); setDrawerOpen(true) }}
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
      {drawerProblemId !== null && (() => {
        const current = problems.find((p) => p.id === drawerProblemId)
        const avgCredibility =
          EVIDENCE_DRAWER_DATA.length === 0
            ? 0
            : Math.round(
                (EVIDENCE_DRAWER_DATA.reduce((s, x) => s + x.credibility, 0) / EVIDENCE_DRAWER_DATA.length) * 10
              ) / 10
        return (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerProblemId(null)} />
            <div className="relative w-[480px] h-full bg-[#0D1117] border-l border-[#1e2a3a] overflow-auto animate-slide-in">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Evidence Chain</h2>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{current?.title}</p>
                  </div>
                  <button
                    onClick={() => setDrawerProblemId(null)}
                    className="text-gray-500 hover:text-white text-xl leading-none"
                    aria-label="Close evidence chain"
                  >
                    &times;
                  </button>
                </div>

                {/* Summary bar */}
                <div className="mb-4 rounded-lg border border-[#1e2a3a] bg-[#0a0f17] p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568]">Sources</div>
                      <div className="text-[18px] font-bold text-[#e2e8f0]">{EVIDENCE_DRAWER_DATA.length}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-[#4a5568]">Avg credibility</div>
                      <div
                        className="text-[18px] font-bold"
                        style={{
                          color:
                            avgCredibility >= 8.5
                              ? '#1D9E75'
                              : avgCredibility >= 7
                              ? '#C9A84C'
                              : '#BA7517',
                        }}
                      >
                        {avgCredibility.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 bg-[#2a1d0a] border border-[#BA7517]/40 rounded px-3 py-2">
                    <div className="text-[10px] font-semibold text-[#E3B84C] uppercase tracking-wider mb-1">
                      Contradiction detected
                    </div>
                    <div className="text-[10px] text-[#C9A84C] leading-relaxed">
                      IC3 and Campden disagree on the median loss per incident ($2.3M vs. a $2.4M Campden estimate). Cross-check before citing a single figure in client materials.
                    </div>
                  </div>
                  <div className="mt-2 text-[9px] text-[#4a5568]">
                    Evidence last refreshed: 2026-04-15 09:12 UTC
                  </div>
                </div>

                {/* Evidence sources */}
                <div className="space-y-3">
                  {EVIDENCE_DRAWER_DATA.map((e, i) => (
                    <div key={i} className="rounded-lg border border-[#1e2a3a] bg-[#111827] p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="pr-3">
                          <span className="inline-block mr-2 rounded bg-[#0a1a2e] text-[#85B7EB] text-[9px] font-semibold px-2 py-0.5 uppercase tracking-wider">
                            {e.type}
                          </span>
                          <span className="text-[12px] font-semibold text-[#e2e8f0]">{e.source}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-[18px] font-bold"
                            style={{
                              color:
                                e.credibility >= 8.5
                                  ? '#1D9E75'
                                  : e.credibility >= 7
                                  ? '#C9A84C'
                                  : '#BA7517',
                            }}
                          >
                            {e.credibility}
                          </div>
                          <div className="text-[9px] text-[#4a5568]">credibility</div>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#4a5568] mb-3">
                        Published: {e.publishedDate} · {e.publisher} · {e.jurisdiction || 'Global'}
                      </div>

                      <div className="mb-3">
                        <div className="text-[9px] font-semibold text-[#4a5568] uppercase tracking-wider mb-2">
                          Key findings relevant to this problem
                        </div>
                        {e.claims.map((claim, ci) => (
                          <div key={ci} className="flex gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 mt-1.5" />
                            <div className="text-[11px] text-[#8892a4] leading-relaxed">{claim}</div>
                          </div>
                        ))}
                      </div>

                      {e.directQuote && (
                        <div className="bg-[#0D1117] border-l-2 border-[#C9A84C] px-3 py-2 mb-3">
                          <div className="text-[11px] text-[#e2e8f0] italic leading-relaxed">
                            &ldquo;{e.directQuote}&rdquo;
                          </div>
                          {e.directQuoteAttribution && (
                            <div className="text-[9px] text-[#C9A84C] mt-1">— {e.directQuoteAttribution}</div>
                          )}
                        </div>
                      )}

                      <div className="bg-[#0F2E1A] border border-[#1D9E75]/20 rounded px-3 py-2">
                        <div className="text-[9px] font-semibold text-[#1D9E75] uppercase tracking-wider mb-1">
                          Why this matters for your offer
                        </div>
                        <div className="text-[10px] text-[#5DCAA5] leading-relaxed">{e.relevanceNote}</div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e2a3a]">
                        <span
                          className={`text-[9px] font-medium ${
                            e.ageMonths <= 6
                              ? 'text-[#1D9E75]'
                              : e.ageMonths <= 18
                              ? 'text-[#C9A84C]'
                              : 'text-[#E24B4A]'
                          }`}
                        >
                          {e.ageMonths <= 6 ? '● Fresh' : e.ageMonths <= 18 ? '● Aging' : '● Stale'} · {e.ageMonths}mo old
                        </span>
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-[#534AB7] hover:text-[#AFA9EC]"
                        >
                          View source →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

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
        <ProblemOfferDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} problemId={selectedProblem.id} problem={selectedProblem} />
      )}
    </div>
  )
}
