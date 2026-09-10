'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopBar from '../components/shared/TopBar'
import CommandAIButton from '../components/shared/CommandAIButton'

// ─── Types ───────────────────────────────────────────────────
type Status = 'active' | 'draft' | 'in_negotiation' | 'pending_approval' | 'sunset'
type Tier = 'HNW' | 'UHNW'
type RedTeam = 'Passed' | 'Failed' | 'Not run'
type DealItem = { label: string; done: boolean }

interface Offer {
  id: string
  name: string
  client: string
  tier: Tier
  status: Status
  monthly: number
  delivery: string
  dealDesk: DealItem[]
  kpisDefined: number
  kpisTotal: number
  redTeam: RedTeam
  health: number | null
  healthTrend: string | null
  renewalDate: string | null
  renewalDays: number | null
  nextAction: string
  actionColor: string
  draftProgress?: number
}

// ─── Inline Data ─────────────────────────────────────────────
const OFFERS: Offer[] = [
  {
    id: '1', name: 'Private Ops Office — Chen', client: 'Sarah Chen', tier: 'HNW', status: 'active',
    monthly: 22000, delivery: 'Orchestrated',
    dealDesk: [{ label: 'Contract', done: true }, { label: 'NDA', done: true }, { label: 'Proposal', done: true }],
    kpisDefined: 4, kpisTotal: 4, redTeam: 'Passed', health: 87, healthTrend: '↑+3',
    renewalDate: 'Sep 12', renewalDays: 161, nextAction: 'Monitor · All good', actionColor: 'text-emerald-400',
  },
  {
    id: '2', name: 'Family Cyber Command — Wellington', client: 'Wellington Trust', tier: 'UHNW', status: 'draft',
    monthly: 18000, delivery: 'Team', draftProgress: 45,
    dealDesk: [{ label: 'Contract', done: false }, { label: 'NDA', done: true }, { label: 'Proposal', done: false }],
    kpisDefined: 2, kpisTotal: 4, redTeam: 'Failed', health: null, healthTrend: null,
    renewalDate: null, renewalDays: null, nextAction: 'Fix red-team issues', actionColor: 'text-red-400',
  },
  {
    id: '3', name: 'Ecosystem Orchestrator — Harrington', client: 'Harrington Dynasty', tier: 'UHNW', status: 'active',
    monthly: 35000, delivery: 'Orchestrated',
    dealDesk: [{ label: 'Contract', done: true }, { label: 'NDA', done: true }, { label: 'Proposal', done: true }],
    kpisDefined: 4, kpisTotal: 4, redTeam: 'Passed', health: 94, healthTrend: '↑+2',
    renewalDate: 'Dec 1', renewalDays: 241, nextAction: 'Quarterly review due', actionColor: 'text-[#C9A84C]',
  },
  {
    id: '4', name: 'Footprint Reduction — Reid', client: 'Marcus Reid', tier: 'HNW', status: 'in_negotiation',
    monthly: 12000, delivery: 'Tech-Assisted',
    dealDesk: [{ label: 'Contract', done: false }, { label: 'NDA', done: true }, { label: 'Proposal', done: true }],
    kpisDefined: 1, kpisTotal: 4, redTeam: 'Not run', health: null, healthTrend: null,
    renewalDate: null, renewalDays: null, nextAction: 'Complete deal desk', actionColor: 'text-[#C9A84C]',
  },
  {
    id: '5', name: 'Medical Nav — Thornton', client: 'Elizabeth Thornton', tier: 'HNW', status: 'sunset',
    monthly: 15000, delivery: 'Solo',
    dealDesk: [{ label: 'Contract', done: true }, { label: 'NDA', done: true }, { label: 'Proposal', done: true }],
    kpisDefined: 3, kpisTotal: 4, redTeam: 'Passed', health: 45, healthTrend: '↓-8',
    renewalDate: 'Apr 30', renewalDays: 27, nextAction: 'Execute sunset plan', actionColor: 'text-amber-400',
  },
  {
    id: '6', name: 'Household Workforce — Walsh', client: 'Diana Walsh', tier: 'UHNW', status: 'pending_approval',
    monthly: 20000, delivery: 'Team',
    dealDesk: [{ label: 'Contract', done: false }, { label: 'NDA', done: false }, { label: 'Proposal', done: false }],
    kpisDefined: 0, kpisTotal: 4, redTeam: 'Not run', health: null, healthTrend: null,
    renewalDate: null, renewalDays: null, nextAction: 'Pending risk review', actionColor: 'text-amber-400',
  },
  {
    id: '7', name: 'Travel Reliability — Patel', client: 'Raj Patel', tier: 'HNW', status: 'draft',
    monthly: 8000, delivery: 'Solo', draftProgress: 20,
    dealDesk: [{ label: 'Contract', done: false }, { label: 'NDA', done: false }, { label: 'Proposal', done: false }],
    kpisDefined: 0, kpisTotal: 4, redTeam: 'Not run', health: null, healthTrend: null,
    renewalDate: null, renewalDays: null, nextAction: 'Build value stack', actionColor: 'text-[#C9A84C]',
  },
  {
    id: '8', name: 'Property Resilience — Greenfield', client: 'James Greenfield', tier: 'HNW', status: 'active',
    monthly: 18000, delivery: 'Team',
    dealDesk: [{ label: 'Contract', done: true }, { label: 'NDA', done: true }, { label: 'Proposal', done: true }],
    kpisDefined: 4, kpisTotal: 4, redTeam: 'Passed', health: 78, healthTrend: '↑+1',
    renewalDate: 'Oct 15', renewalDays: 194, nextAction: 'Build proof assets', actionColor: 'text-[#C9A84C]',
  },
]

const KPIS = [
  { label: 'TOTAL MRR', value: '$75K', trend: '▲ +12%', up: true, sub: '' },
  { label: 'ACTIVE OFFERS', value: '3', trend: '', up: true, sub: '$75K revenue' },
  { label: 'PIPELINE VALUE', value: '$132K', trend: '', up: true, sub: '2 drafts' },
  { label: 'AVG HEALTH SCORE', value: '81', trend: '', up: true, sub: '0 critical' },
  { label: 'RENEWALS DUE', value: '1', trend: '', up: false, sub: '' },
  { label: 'NEEDS ATTENTION', value: '2', trend: '', up: false, sub: '' },
]

type FilterTab = 'all' | 'active' | 'draft' | 'in_negotiation' | 'pending_approval' | 'sunset' | 'needs_attention'

const FILTER_TABS: { key: FilterTab; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: 8 },
  { key: 'active', label: 'Active', count: 3 },
  { key: 'draft', label: 'Draft', count: 2 },
  { key: 'in_negotiation', label: 'In Negotiation', count: 1 },
  { key: 'pending_approval', label: 'Pending Approval', count: 1 },
  { key: 'sunset', label: 'Sunset', count: 1 },
  { key: 'needs_attention', label: 'Needs Attention', count: 2 },
]

const STATUS_COLORS: Record<Status, string> = {
  active: 'bg-emerald-900/50 text-emerald-400 border-emerald-700',
  draft: 'bg-blue-900/50 text-blue-400 border-blue-700',
  in_negotiation: 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/40',
  pending_approval: 'bg-purple-900/50 text-purple-400 border-purple-700',
  sunset: 'bg-amber-900/50 text-amber-400 border-amber-700',
}

const STATUS_LABELS: Record<Status, string> = {
  active: 'Active', draft: 'Draft', in_negotiation: 'Negotiation',
  pending_approval: 'Pending', sunset: 'Sunset',
}

const SORT_OPTIONS = ['Name A-Z', 'Name Z-A', 'Revenue High', 'Revenue Low', 'Health High', 'Health Low']

const MRR_DATA = [
  { month: 'Oct', value: 52 }, { month: 'Nov', value: 58 }, { month: 'Dec', value: 63 },
  { month: 'Jan', value: 68 }, { month: 'Feb', value: 72 }, { month: 'Mar', value: 75 },
]

const RED_TEAM_ISSUES = [
  { title: 'Compliance Risk', desc: 'Offer references data processing without GDPR/CCPA addendum. Cross-border data handling not addressed in current scope.', fix: 'Add regulatory compliance addendum and data processing agreement to contract.' },
  { title: 'Delivery Fragility', desc: 'Single point of failure in team structure. No backup analyst assigned. SLA lacks escalation path for critical incidents.', fix: 'Assign backup analyst, add escalation matrix, and define failover procedures in SLA.' },
  { title: 'Vague Guarantees', desc: 'Outcome language implies guaranteed results ("ensure protection", "eliminate risk"). Legal exposure if client expectations unmet.', fix: 'Replace guarantee language with best-effort commitments and add explicit disclaimer section.' },
]

const NEEDS_ATTENTION = [
  { name: 'Wellington Trust', border: 'border-red-500/50', issues: ['Failed red-team assessment', 'Missing contract — deal desk incomplete'] },
  { name: 'Elizabeth Thornton', border: 'border-amber-500/50', issues: ['Sunset in 27 days', 'Health score below 50 (45)'] },
]

// ─── Helper: needs-attention IDs ─────────────────────────────
const ATTENTION_IDS = new Set(['2', '5'])

// ─── Page Component ──────────────────────────────────────────
export default function OffersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Name A-Z')
  const [tierFilter, setTierFilter] = useState<'All' | 'HNW' | 'UHNW'>('All')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [showRedTeam, setShowRedTeam] = useState(false)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [fullDrawerOffer, setFullDrawerOffer] = useState<Offer | null>(null)
  const [revenueSliderClients, setRevenueSliderClients] = useState(5)

  useEffect(() => {
    if (!fullDrawerOffer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullDrawerOffer(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullDrawerOffer])

  const toggleCheck = (id: string) => {
    const n = new Set(checked)
    n.has(id) ? n.delete(id) : n.add(id)
    setChecked(n)
  }

  const filtered = useMemo(() => {
    let list = [...OFFERS]
    // Tab filter
    if (activeTab === 'needs_attention') list = list.filter(o => ATTENTION_IDS.has(o.id))
    else if (activeTab !== 'all') list = list.filter(o => o.status === activeTab)
    // Tier filter
    if (tierFilter !== 'All') list = list.filter(o => o.tier === tierFilter)
    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o => o.name.toLowerCase().includes(q) || o.client.toLowerCase().includes(q))
    }
    // Sort
    switch (sort) {
      case 'Name A-Z': list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'Name Z-A': list.sort((a, b) => b.name.localeCompare(a.name)); break
      case 'Revenue High': list.sort((a, b) => b.monthly - a.monthly); break
      case 'Revenue Low': list.sort((a, b) => a.monthly - b.monthly); break
      case 'Health High': list.sort((a, b) => (b.health ?? -1) - (a.health ?? -1)); break
      case 'Health Low': list.sort((a, b) => (a.health ?? 999) - (b.health ?? 999)); break
    }
    return list
  }, [activeTab, search, sort, tierFilter])

  const healthColor = (h: number | null) => {
    if (h === null) return 'text-gray-500'
    if (h >= 80) return 'text-emerald-400'
    if (h >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const renewalColor = (d: number | null) => {
    if (d === null) return 'text-gray-500'
    if (d <= 7) return 'text-red-400'
    if (d <= 30) return 'text-amber-400'
    return 'text-gray-300'
  }

  const redTeamBadge = (rt: RedTeam) => {
    if (rt === 'Passed') return 'bg-emerald-900/50 text-emerald-400'
    if (rt === 'Failed') return 'bg-red-900/50 text-red-400 cursor-pointer'
    return 'bg-gray-800 text-gray-500'
  }

  const maxMRR = Math.max(...MRR_DATA.map(d => d.value))

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* ── TopBar ─────────────────────────────────────── */}
      <TopBar activePage="Offers" />
      <CommandAIButton />

      <div className="px-6 py-4">
        {/* ── KPI Strip ──────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {KPIS.map(k => (
            <div key={k.label} className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{k.label}</div>
              <div className="text-xl font-semibold mt-1">{k.value}</div>
              {k.trend && <div className={`text-[11px] mt-1 ${k.up ? 'text-emerald-400' : 'text-red-400'}`}>{k.trend}</div>}
              {k.sub && <div className={`text-[11px] mt-0.5 ${
                k.label === 'AVG HEALTH SCORE' ? 'text-emerald-400' :
                k.label === 'RENEWALS DUE' ? 'text-amber-400' :
                k.label === 'NEEDS ATTENTION' ? 'text-red-400' : 'text-gray-400'
              }`}>{k.sub}</div>}
              {k.label === 'RENEWALS DUE' && !k.sub && <div className="text-[11px] mt-0.5 text-amber-400">due soon</div>}
              {k.label === 'NEEDS ATTENTION' && !k.sub && <div className="text-[11px] mt-0.5 text-red-400">action required</div>}
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ────────────────────────────── */}
        <div className="flex gap-2 mb-4">
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setSelectedOffer(null) }}
              className={`text-xs px-3 py-1.5 rounded-lg ${activeTab === t.key
                ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]'
                : 'bg-[#111827] text-gray-400 border border-[#1e2a3a] hover:text-white'
              }`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* ── Toolbar ────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-4">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search offers or clients..."
            className="w-64 bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm placeholder-gray-500 focus:border-[#C9A84C] focus:outline-none"
          />
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
            {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value as 'All' | 'HNW' | 'UHNW')}
            className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
            <option value="All">All Tiers</option>
            <option value="HNW">HNW</option>
            <option value="UHNW">UHNW</option>
          </select>
          <div className="ml-auto flex gap-1">
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'text-gray-500 hover:text-white'}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="3" rx="0.5"/><rect x="1" y="6" width="14" height="3" rx="0.5"/><rect x="1" y="11" width="14" height="3" rx="0.5"/></svg>
            </button>
            <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'text-gray-500 hover:text-white'}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
            </button>
          </div>
        </div>

        {/* ── 3-Column Layout ────────────────────────── */}
        <div className="flex gap-6">
          {/* Center: Table / Cards */}
          <div className="flex-1 min-w-0">
            {viewMode === 'table' ? (
              <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e2a3a] text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="p-3 w-8"><input type="checkbox" className="accent-[#C9A84C]" /></th>
                      <th className="p-3 text-left">Offer · Client</th>
                      <th className="p-3 text-left">Tier</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Monthly</th>
                      <th className="p-3 text-left">Delivery</th>
                      <th className="p-3 text-left">Deal Desk</th>
                      <th className="p-3 text-center">KPIs</th>
                      <th className="p-3 text-center">Red-Team</th>
                      <th className="p-3 text-center">Health</th>
                      <th className="p-3 text-left">Renewal</th>
                      <th className="p-3 text-left">Next Action</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(o => (
                      <tr key={o.id}
                        onClick={() => setSelectedOffer(selectedOffer?.id === o.id ? null : o)}
                        className={`border-b border-[#1e2a3a]/50 hover:bg-[#1a2332] cursor-pointer transition-colors ${selectedOffer?.id === o.id ? 'bg-[#1a2332] border-l-2 border-l-[#C9A84C]' : ''}`}>
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={checked.has(o.id)} onChange={() => toggleCheck(o.id)} className="accent-[#C9A84C]" />
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-white text-[13px]">{o.name}</div>
                          <div className="text-[11px] text-gray-500">{o.client}</div>
                          {o.draftProgress !== undefined && (
                            <div className="mt-1 w-24 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${o.draftProgress}%` }} />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${o.tier === 'UHNW' ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-blue-500 text-blue-400'}`}>{o.tier}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                        </td>
                        <td className="p-3 text-right font-mono text-[13px]">${(o.monthly / 1000).toFixed(0)}K</td>
                        <td className="p-3 text-[12px] text-gray-400">{o.delivery}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {o.dealDesk.map(d => (
                              <span key={d.label} className={`text-[9px] px-1.5 py-0.5 rounded ${d.done
                                ? d.label === 'Contract' ? 'bg-emerald-900/50 text-emerald-400' : d.label === 'NDA' ? 'bg-purple-900/50 text-purple-400' : 'bg-[#C9A84C]/15 text-[#C9A84C]'
                                : 'bg-red-900/30 text-red-400'
                              }`}>
                                {d.done ? '✓' : '✗'} {d.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-0.5 justify-center">
                            {Array.from({ length: o.kpisTotal }).map((_, i) => (
                              <span key={i} className={`w-2 h-2 rounded-full ${i < o.kpisDefined ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center" onClick={e => { if (o.redTeam === 'Failed') { e.stopPropagation(); setShowRedTeam(true) } }}>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${redTeamBadge(o.redTeam)}`}>{o.redTeam}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-mono font-semibold ${healthColor(o.health)}`}>
                            {o.health !== null ? o.health : '—'}
                          </span>
                          {o.healthTrend && <span className={`text-[10px] ml-1 ${healthColor(o.health)}`}>{o.healthTrend}</span>}
                        </td>
                        <td className="p-3">
                          {o.renewalDate ? (
                            <div className={renewalColor(o.renewalDays)}>
                              <div className="text-[12px]">{o.renewalDate}</div>
                              <div className="text-[10px]">{o.renewalDays}d</div>
                            </div>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="p-3">
                          <span className={`text-[11px] ${o.actionColor}`}>{o.nextAction}</span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => setSelectedOffer(o)} className="text-gray-500 hover:text-[#C9A84C] text-sm">View →</button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={13} className="p-8 text-center text-gray-500">No offers match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Cards View */
              <div className="grid grid-cols-2 gap-4">
                {filtered.map(o => (
                  <div key={o.id} onClick={() => setSelectedOffer(selectedOffer?.id === o.id ? null : o)}
                    className={`bg-[#111827] rounded-lg border p-4 cursor-pointer hover:border-[#C9A84C]/40 transition-colors ${selectedOffer?.id === o.id ? 'border-[#C9A84C]' : 'border-[#1e2a3a]'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-[13px]">{o.name}</div>
                        <div className="text-[11px] text-gray-500">{o.client}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-[11px]">
                      <span className={`px-1.5 py-0.5 rounded border ${o.tier === 'UHNW' ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-blue-500 text-blue-400'}`}>{o.tier}</span>
                      <span className="font-mono text-white">${(o.monthly / 1000).toFixed(0)}K/mo</span>
                      <span className="text-gray-500">{o.delivery}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-[11px]">
                      <div className="flex gap-0.5">
                        {Array.from({ length: o.kpisTotal }).map((_, i) => (
                          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < o.kpisDefined ? 'bg-emerald-400' : 'bg-gray-700'}`} />
                        ))}
                      </div>
                      <span className={redTeamBadge(o.redTeam) + ' px-1.5 py-0.5 rounded text-[9px]'}>{o.redTeam}</span>
                      <span className={`font-mono font-semibold ${healthColor(o.health)}`}>{o.health ?? '—'}</span>
                    </div>
                    <div className={`mt-2 text-[11px] ${o.actionColor}`}>{o.nextAction}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column (300px) */}
          <div className="w-[300px] shrink-0 space-y-4">
            {selectedOffer ? (
              /* ── Offer Detail Panel ──────────────────── */
              <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Offer Details</h3>
                  <button onClick={() => setSelectedOffer(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
                </div>
                <div className="text-[13px] font-medium text-[#C9A84C] mb-1">{selectedOffer.name}</div>
                <div className="text-[11px] text-gray-400 mb-3">{selectedOffer.client}</div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${selectedOffer.tier === 'UHNW' ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-blue-500 text-blue-400'}`}>{selectedOffer.tier}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[selectedOffer.status]}`}>{STATUS_LABELS[selectedOffer.status]}</span>
                </div>

                {selectedOffer.draftProgress !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>Completion</span><span>{selectedOffer.draftProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#1e2a3a] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedOffer.draftProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-[12px] border-t border-[#1e2a3a] pt-3">
                  <div className="flex justify-between"><span className="text-gray-500">Monthly</span><span className="font-mono">${(selectedOffer.monthly / 1000).toFixed(0)}K</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>{selectedOffer.delivery}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Health</span><span className={healthColor(selectedOffer.health)}>{selectedOffer.health ?? '—'} {selectedOffer.healthTrend ?? ''}</span></div>
                  {selectedOffer.renewalDate && <div className="flex justify-between"><span className="text-gray-500">Renewal</span><span className={renewalColor(selectedOffer.renewalDays)}>{selectedOffer.renewalDate} · {selectedOffer.renewalDays}d</span></div>}
                </div>

                {/* Deal Desk Status */}
                <div className="border-t border-[#1e2a3a] pt-3 mt-3">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">Deal Desk</div>
                  {selectedOffer.dealDesk.map(d => (
                    <div key={d.label} className="flex items-center gap-2 text-[12px] mb-1.5">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${d.done ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                        {d.done ? '✓' : '✗'}
                      </span>
                      <span className={d.done ? 'text-gray-300' : 'text-red-400'}>{d.label}</span>
                    </div>
                  ))}
                </div>

                {/* Readiness Checklist */}
                <div className="border-t border-[#1e2a3a] pt-3 mt-3">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">Readiness</div>
                  {[
                    { label: 'KPIs defined', ok: selectedOffer.kpisDefined === selectedOffer.kpisTotal },
                    { label: 'Red-team passed', ok: selectedOffer.redTeam === 'Passed' },
                    { label: 'Deal desk complete', ok: selectedOffer.dealDesk.every(d => d.done) },
                    { label: 'Health ≥ 70', ok: (selectedOffer.health ?? 0) >= 70 },
                  ].map(c => (
                    <div key={c.label} className="flex items-center gap-2 text-[12px] mb-1.5">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${c.ok ? 'bg-emerald-900/50 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                        {c.ok ? '✓' : '○'}
                      </span>
                      <span className={c.ok ? 'text-gray-300' : 'text-gray-500'}>{c.label}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="border-t border-[#1e2a3a] pt-3 mt-3 flex gap-2">
                  <button onClick={() => router.push(`/offers/${selectedOffer?.id}/edit`)} className="flex-1 bg-[#C9A84C] text-[#0D1117] font-semibold text-xs py-2 rounded-lg hover:bg-[#C9A84C]/90">Edit Offer</button>
                  <button onClick={() => { setFullDrawerOffer(selectedOffer); setRevenueSliderClients(5) }} className="flex-1 bg-[#1e2a3a] text-gray-300 text-xs py-2 rounded-lg hover:bg-[#1e2a3a]/80">View Full</button>
                </div>
              </div>
            ) : (
              /* ── Default Right Column ────────────────── */
              <>
                {/* Needs Attention */}
                <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Needs Attention</h3>
                  {NEEDS_ATTENTION.map(n => (
                    <div key={n.name} className={`border-l-2 ${n.border} pl-3 mb-3 last:mb-0`}>
                      <div className="text-[12px] font-medium text-white">{n.name}</div>
                      {n.issues.map(issue => (
                        <div key={issue} className="text-[11px] text-gray-400 mt-0.5">• {issue}</div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* MRR Chart */}
                <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">MRR Trend</h3>
                  <svg viewBox="0 0 240 120" className="w-full">
                    {MRR_DATA.map((d, i) => {
                      const barH = (d.value / maxMRR) * 80
                      const x = i * 40 + 8
                      return (
                        <g key={d.month}>
                          <rect x={x} y={95 - barH} width="24" height={barH} rx="3" fill="#C9A84C" opacity={0.7 + i * 0.05} />
                          <text x={x + 12} y={110} textAnchor="middle" fill="#6b7280" fontSize="9">{d.month}</text>
                          <text x={x + 12} y={90 - barH} textAnchor="middle" fill="#9ca3af" fontSize="8">${d.value}K</text>
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Quick Stats */}
                <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between"><span className="text-gray-500">Avg deal size</span><span className="text-white font-mono">$18.5K</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Longest client</span><span className="text-white">Harrington 4mo</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Top playbook</span><span className="text-[#C9A84C]">Private Ops Office</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── OfferFullDrawer ───────────────────────────── */}
      {fullDrawerOffer && (() => {
        const o = fullDrawerOffer
        const annualMRR = o.monthly * 12
        const revenueAtN = o.monthly * revenueSliderClients * 12
        const kpisOk = o.kpisDefined === o.kpisTotal
        const redTeamOk = o.redTeam === 'Passed'
        const dealDeskOk = o.dealDesk.every(d => d.done)
        const healthOk = (o.health ?? 0) >= 70
        return (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setFullDrawerOffer(null)} />
            <div className="fixed top-0 right-0 h-full w-[700px] bg-[#0D1117] border-l border-[#1e2a3a] z-50 overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-[#0D1117] border-b border-[#1e2a3a] z-10 px-6 py-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${o.tier === 'UHNW' ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-blue-500 text-blue-400'}`}>{o.tier}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{o.name}</h2>
                  <div className="text-[12px] text-gray-400 mt-0.5">{o.client} · {o.delivery}</div>
                </div>
                <button onClick={() => setFullDrawerOffer(null)} className="text-gray-500 hover:text-white text-xl" aria-label="Close">✕</button>
              </div>

              <div className="px-6 py-5 grid grid-cols-5 gap-5">
                {/* LEFT COLUMN 60% (3/5) */}
                <div className="col-span-3 space-y-5">
                  {/* Problem this solves */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">The problem this solves</div>
                    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-[13px] font-semibold text-[#C9A84C]">UHNW household cyber & impersonation risk</div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400">Accelerating</span>
                      </div>
                      <p className="text-[12px] text-gray-300 leading-relaxed">
                        Wealthy families face a 37% year-over-year increase in targeted cyber and AI-impersonation fraud, with median losses of $2.4M per incident. Most households lack a formal protocol to verify wire transfers, vet staff, or respond to voice-cloned requests.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-[11px]">
                        <span className="text-gray-500">Credibility: <span className="text-emerald-400 font-semibold">9.2</span></span>
                        <span className="text-gray-500">4 sources</span>
                        <span className="text-gray-500">Last refreshed: 2d ago</span>
                      </div>
                    </div>
                  </section>

                  {/* What's included */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">What&rsquo;s included</div>
                    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4 space-y-2">
                      {[
                        { name: 'Quarterly household security audit', desc: 'Physical + digital surface review' },
                        { name: 'Wire verification protocol', desc: 'Signed, rehearsed, documented' },
                        { name: 'Staff + vendor vetting', desc: 'Ongoing background monitoring' },
                        { name: 'Incident response on retainer', desc: '24/7 hotline, 2-hour SLA' },
                        { name: 'Quarterly red-team drill', desc: 'Simulated phishing + voice-clone attempts' },
                      ].map(item => (
                        <div key={item.name} className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <div>
                            <div className="text-[12px] text-gray-200">{item.name}</div>
                            <div className="text-[11px] text-gray-500">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Value Stack */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">Value stack</div>
                    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg overflow-hidden">
                      <table className="w-full text-[12px]">
                        <thead className="text-[10px] uppercase text-gray-500">
                          <tr className="border-b border-[#1e2a3a]">
                            <th className="text-left p-2">Deliverable</th>
                            <th className="text-left p-2">Frequency</th>
                            <th className="text-right p-2">hrs/wk</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { d: 'Security audit report', f: 'Quarterly', h: 4 },
                            { d: 'Wire verification ops', f: 'Per transaction', h: 2 },
                            { d: 'Staff vetting reports', f: 'Monthly', h: 3 },
                            { d: 'Incident response standby', f: 'Continuous', h: 2 },
                            { d: 'Red-team drill + report', f: 'Quarterly', h: 5 },
                          ].map(r => (
                            <tr key={r.d} className="border-b border-[#1e2a3a]/50 last:border-0">
                              <td className="p-2 text-gray-300">{r.d}</td>
                              <td className="p-2 text-gray-500">{r.f}</td>
                              <td className="p-2 text-right font-mono text-gray-400">{r.h}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* KPI Stack */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">KPI stack</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { k: 'Incidents detected / quarter', v: o.status === 'active' ? '2' : '—' },
                        { k: 'Mean response time (min)', v: o.status === 'active' ? '18' : '—' },
                        { k: 'Staff vetting coverage', v: o.status === 'active' ? '100%' : '—' },
                        { k: 'Client NPS', v: o.status === 'active' ? '71' : '—' },
                      ].map((k, i) => (
                        <div key={i} className="bg-[#111827] border border-[#1e2a3a] rounded p-3">
                          <div className="text-[10px] text-gray-500">{k.k}</div>
                          <div className="text-base font-semibold text-white mt-0.5">{k.v}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* SOPs */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">SOPs (first 3)</div>
                    <div className="space-y-2">
                      {[
                        { n: 'Wire verification callback protocol', s: '4 steps · ~12 min per execution' },
                        { n: 'New household staff onboarding vet', s: '9 steps · 2-3 days' },
                        { n: 'Voice-clone phishing incident handling', s: '6 steps · ≤2 hr from trigger' },
                      ].map(sop => (
                        <details key={sop.n} className="bg-[#111827] border border-[#1e2a3a] rounded-lg">
                          <summary className="cursor-pointer px-3 py-2 text-[12px] text-gray-200 flex justify-between items-center">
                            <span>{sop.n}</span>
                            <span className="text-[10px] text-gray-500">{sop.s}</span>
                          </summary>
                          <div className="px-3 pb-3 text-[11px] text-gray-400 leading-relaxed">
                            Full SOP available in the Playbooks page. This is a summary placeholder.
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN 40% (2/5) */}
                <div className="col-span-2 space-y-5">
                  {/* Price */}
                  <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Price</div>
                    <div className="text-3xl font-bold text-[#C9A84C] mt-1">
                      ${(o.monthly / 1000).toFixed(0)}K<span className="text-sm text-gray-500">/mo</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">Monthly retainer · Net-15 terms</div>
                    <div className="text-[11px] text-gray-500 mt-2">Annual value: <span className="font-mono text-gray-300">${(annualMRR / 1000).toFixed(0)}K</span></div>
                  </section>

                  {/* Revenue calculator */}
                  <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Revenue at scale</div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                      <span>Clients</span>
                      <span className="font-mono text-white">{revenueSliderClients}</span>
                    </div>
                    <input
                      type="range" min={1} max={20} value={revenueSliderClients}
                      onChange={e => setRevenueSliderClients(Number(e.target.value))}
                      className="w-full accent-[#C9A84C]"
                    />
                    <div className="mt-3 text-center">
                      <div className="text-[10px] text-gray-500">Annual revenue</div>
                      <div className="text-xl font-bold text-emerald-400 font-mono">${(revenueAtN / 1000).toFixed(0)}K</div>
                    </div>
                  </section>

                  {/* Deal desk */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">Deal desk</div>
                    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3 space-y-2">
                      {o.dealDesk.map(d => (
                        <div key={d.label} className="flex items-center justify-between text-[12px]">
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${d.done ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>{d.done ? '✓' : '✗'}</span>
                            <span className={d.done ? 'text-gray-300' : 'text-red-400'}>{d.label}</span>
                          </div>
                          <button className="text-[10px] text-[#C9A84C] hover:underline">
                            {d.done ? 'View' : d.label === 'Proposal' ? 'Generate' : 'Upload'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Red-team status */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">Red-team</div>
                    <div className={`border rounded-lg p-3 ${o.redTeam === 'Passed' ? 'bg-[#0F2E1A] border-emerald-700/40' : o.redTeam === 'Failed' ? 'bg-[#1f0d0d] border-red-700/40' : 'bg-[#111827] border-[#1e2a3a]'}`}>
                      <div className="flex items-center justify-between text-[12px]">
                        <span className={o.redTeam === 'Passed' ? 'text-emerald-400' : o.redTeam === 'Failed' ? 'text-red-400' : 'text-gray-500'}>{o.redTeam}</span>
                        <span className="text-[10px] text-gray-500">Last run: 2d ago</span>
                      </div>
                      {o.redTeam === 'Failed' && (
                        <ul className="mt-2 text-[11px] text-gray-400 space-y-1">
                          {RED_TEAM_ISSUES.slice(0, 2).map(i => (
                            <li key={i.title}>• {i.title}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>

                  {/* Health */}
                  {o.health !== null && (
                    <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500">Health score</div>
                          <div className={`text-2xl font-bold font-mono ${healthColor(o.health)}`}>{o.health}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-gray-500">Trend</div>
                          <div className={`text-[13px] ${healthColor(o.health)}`}>{o.healthTrend || '—'}</div>
                          <div className="text-[10px] text-gray-500 mt-1">Updated 1h ago</div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Renewal */}
                  {o.renewalDate && (
                    <section className={`border rounded-lg p-3 ${(o.renewalDays ?? 0) <= 30 ? 'bg-[#2a1d0a] border-amber-700/40' : 'bg-[#111827] border-[#1e2a3a]'}`}>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Renewal</div>
                      <div className="text-[13px] text-white mt-1">{o.renewalDate} · <span className={renewalColor(o.renewalDays)}>{o.renewalDays}d remaining</span></div>
                      <button className="mt-2 w-full bg-[#C9A84C] text-[#0D1117] text-[11px] font-semibold py-1.5 rounded hover:bg-[#C9A84C]/90">Prepare renewal</button>
                    </section>
                  )}

                  {/* Readiness checklist */}
                  <section>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">Readiness</div>
                    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3 space-y-1.5">
                      {[
                        { label: 'KPIs defined', ok: kpisOk },
                        { label: 'Red-team passed', ok: redTeamOk },
                        { label: 'Deal desk complete', ok: dealDeskOk },
                        { label: 'Health ≥ 70', ok: healthOk },
                      ].map(c => (
                        <div key={c.label} className="flex items-center gap-2 text-[12px]">
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${c.ok ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/30 text-amber-400'}`}>{c.ok ? '✓' : '!'}</span>
                          <span className={c.ok ? 'text-gray-300' : 'text-amber-400'}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Next action */}
                  <section className="bg-[#0F2E1A] border border-emerald-700/30 rounded-lg p-3">
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium mb-1">Next action — Command AI</div>
                    <div className="text-[12px] text-gray-200 leading-relaxed">{o.nextAction}</div>
                  </section>
                </div>
              </div>
            </div>
          </>
        )
      })()}

      {/* ── Red-Team Drawer ───────────────────────────── */}
      {showRedTeam && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowRedTeam(false)} />
          <div className="fixed top-0 right-0 h-full w-[480px] bg-[#111827] border-l border-[#1e2a3a] z-50 overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Red-Team Assessment</h2>
                  <p className="text-[12px] text-gray-500 mt-1">Family Cyber Command — Wellington Trust</p>
                </div>
                <button onClick={() => setShowRedTeam(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <span className="bg-red-900/50 text-red-400 text-[11px] px-2.5 py-1 rounded font-medium">FAILED</span>
                <span className="text-[11px] text-gray-500">3 issues found · Last run 2 hours ago</span>
              </div>

              <div className="space-y-4">
                {RED_TEAM_ISSUES.map((issue, i) => (
                  <div key={i} className="bg-[#0D1117] rounded-lg border border-red-900/30 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-900/50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-400 text-[11px] font-bold">✗</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-red-400 mb-1">{issue.title}</div>
                        <div className="text-[12px] text-gray-400 mb-3">{issue.desc}</div>
                        <div className="bg-[#111827] rounded p-3 border border-[#1e2a3a]">
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">Recommended Fix</div>
                          <div className="text-[12px] text-gray-300">{issue.fix}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-[#C9A84C] text-[#0D1117] font-semibold py-3 rounded-lg hover:bg-[#C9A84C]/90 text-sm">
                Resolve All & Re-run Assessment
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
