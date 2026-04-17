'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import JargonTooltip from '@/app/components/shared/JargonTooltip'

// ─── Types ───────────────────────────────────────────────────
type Status = 'active' | 'prospect' | 'at_risk' | 'alumni'
type WealthEventType = 'exit' | 'inheritance' | 'board' | 'ipo' | null
type FilterTab = 'all' | 'active' | 'prospect' | 'at_risk' | 'renewal' | 'wealth_event' | 'alumni'

interface WealthEvent { type: WealthEventType; label: string; amount?: string }
interface Touchpoint { type: string; desc: string; time: string }
interface Client {
  id: string; name: string; company: string; trustChannel: string
  tier: 'HNW' | 'UHNW'; status: Status; painFocus: string[]
  lastContact: string; lastContactDays: number
  wealthEvent: WealthEvent | null; health: number | null; trend: string | null
  kpiHit: number | null; kpiTotal: number | null
  retainer: number | null; retainerTarget: number | null
  renewalDate: string | null; renewalDays: number | null
  channel: string; actions: string[]
  touchpoints: Touchpoint[]
}

// ─── Inline Data ─────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: '1', name: 'Sarah Chen', company: 'Chen Family Office', trustChannel: 'Private banker',
    tier: 'HNW', status: 'active', painFocus: ['Coordination'],
    lastContact: 'Yesterday', lastContactDays: 1,
    wealthEvent: null, health: 87, trend: '+3', kpiHit: 4, kpiTotal: 4,
    retainer: 22000, retainerTarget: null,
    renewalDate: 'Sep 12', renewalDays: 161, channel: 'Private banker',
    actions: ['View', 'Brief', 'Upsell'],
    touchpoints: [
      { type: 'call', desc: 'Quarterly check-in call', time: 'Yesterday' },
      { type: 'email', desc: 'Sent coordination update', time: '3 days ago' },
      { type: 'review', desc: 'Quarterly review meeting', time: '2 weeks ago' },
    ],
  },
  {
    id: '2', name: 'Wellington Trust', company: 'Wellington Family Trust', trustChannel: 'Estate attorney',
    tier: 'UHNW', status: 'active', painFocus: ['Security'],
    lastContact: '12 days ago', lastContactDays: 12,
    wealthEvent: null, health: 62, trend: '-9', kpiHit: 2, kpiTotal: 4,
    retainer: 18000, retainerTarget: null,
    renewalDate: 'Jun 1', renewalDays: 58, channel: 'Estate attorney',
    actions: ['View', 'Brief', 'Intervene'],
    touchpoints: [
      { type: 'email', desc: 'Sent security audit summary', time: '12 days ago' },
      { type: 'call', desc: 'Attempted follow-up call', time: '8 days ago' },
      { type: 'alert', desc: 'Health score dropped below 65', time: '3 days ago' },
    ],
  },
  {
    id: '3', name: 'Harrington Dynasty', company: 'Harrington Holdings', trustChannel: 'Wealth manager',
    tier: 'UHNW', status: 'active', painFocus: ['Coordination', 'Privacy'],
    lastContact: '3 days ago', lastContactDays: 3,
    wealthEvent: { type: 'board', label: 'Board appt' }, health: 94, trend: '+2', kpiHit: 4, kpiTotal: 4,
    retainer: 35000, retainerTarget: null,
    renewalDate: 'Dec 1', renewalDays: 241, channel: 'Wealth manager',
    actions: ['View', 'Brief', 'Upsell', 'Wealth event!'],
    touchpoints: [
      { type: 'call', desc: 'Board appointment strategy call', time: '3 days ago' },
      { type: 'email', desc: 'Privacy audit results', time: '1 week ago' },
      { type: 'review', desc: 'Monthly governance review', time: '2 weeks ago' },
    ],
  },
  {
    id: '4', name: 'Marcus Reid', company: 'Reid Ventures', trustChannel: 'Direct',
    tier: 'HNW', status: 'prospect', painFocus: ['Privacy'],
    lastContact: 'Never', lastContactDays: -1,
    wealthEvent: { type: 'exit', label: 'Exit $120M', amount: '$120M' }, health: null, trend: null, kpiHit: null, kpiTotal: null,
    retainer: null, retainerTarget: 12000,
    renewalDate: null, renewalDays: null, channel: 'Direct',
    actions: ['View', 'Brief', 'Decision Room', 'Wealth event!'],
    touchpoints: [
      { type: 'intel', desc: 'Series C exit detected ($120M)', time: '2 hours ago' },
      { type: 'research', desc: 'Background profile compiled', time: '1 day ago' },
      { type: 'alert', desc: 'High-value prospect flagged', time: '2 days ago' },
    ],
  },
  {
    id: '5', name: 'Elizabeth Thornton', company: 'Thornton Estate', trustChannel: 'Private banker',
    tier: 'HNW', status: 'alumni', painFocus: ['Medical'],
    lastContact: '45 days ago', lastContactDays: 45,
    wealthEvent: { type: 'inheritance', label: 'Inheritance $45M', amount: '$45M' }, health: 45, trend: null, kpiHit: null, kpiTotal: null,
    retainer: null, retainerTarget: null,
    renewalDate: 'Ended Mar 2026', renewalDays: null, channel: 'Private banker',
    actions: ['View', 'Re-engage', 'Referral', 'Wealth event!'],
    touchpoints: [
      { type: 'event', desc: 'Inheritance transfer initiated ($45M)', time: '5 hours ago' },
      { type: 'email', desc: 'Off-boarding follow-up sent', time: '30 days ago' },
      { type: 'call', desc: 'Final service review', time: '45 days ago' },
    ],
  },
  {
    id: '6', name: 'Diana Walsh', company: 'Walsh Capital', trustChannel: 'Wealth manager',
    tier: 'UHNW', status: 'prospect', painFocus: ['Governance'],
    lastContact: '8 days ago', lastContactDays: 8,
    wealthEvent: { type: 'board', label: 'Board' }, health: null, trend: null, kpiHit: null, kpiTotal: null,
    retainer: null, retainerTarget: 20000,
    renewalDate: null, renewalDays: null, channel: 'Wealth manager',
    actions: ['View', 'Brief', 'Decision Room'],
    touchpoints: [
      { type: 'call', desc: 'Initial discovery call', time: '8 days ago' },
      { type: 'email', desc: 'Governance framework sent', time: '6 days ago' },
      { type: 'research', desc: 'Board appointment intel gathered', time: '2 days ago' },
    ],
  },
  {
    id: '7', name: 'Raj Patel', company: 'Patel Family', trustChannel: 'Estate attorney',
    tier: 'HNW', status: 'active', painFocus: ['Property'],
    lastContact: '2 days ago', lastContactDays: 2,
    wealthEvent: { type: 'exit', label: 'Exit $28M', amount: '$28M' }, health: 78, trend: '+1', kpiHit: 3, kpiTotal: 4,
    retainer: 18000, retainerTarget: null,
    renewalDate: 'Oct 15', renewalDays: 194, channel: 'Estate attorney',
    actions: ['View', 'Brief', 'Wealth event!'],
    touchpoints: [
      { type: 'call', desc: 'Property portfolio review', time: '2 days ago' },
      { type: 'email', desc: 'Exit planning timeline', time: '5 days ago' },
      { type: 'review', desc: 'Quarterly property audit', time: '3 weeks ago' },
    ],
  },
  {
    id: '8', name: 'James Greenfield', company: 'Greenfield Bio', trustChannel: 'Direct',
    tier: 'HNW', status: 'prospect', painFocus: ['Medical'],
    lastContact: '5 days ago', lastContactDays: 5,
    wealthEvent: { type: 'ipo', label: 'IPO' }, health: null, trend: null, kpiHit: null, kpiTotal: null,
    retainer: null, retainerTarget: 15000,
    renewalDate: null, renewalDays: null, channel: 'Direct',
    actions: ['View', 'Brief', 'Wealth event!'],
    touchpoints: [
      { type: 'call', desc: 'IPO readiness discussion', time: '5 days ago' },
      { type: 'research', desc: 'Medical sector risk profile', time: '3 days ago' },
      { type: 'email', desc: 'Service overview packet sent', time: '1 day ago' },
    ],
  },
]

const KPIS = [
  { label: 'ACTIVE CLIENTS', value: '3', sub: '+1 this month', color: 'text-emerald-400' },
  { label: 'PROSPECTS', value: '2', sub: 'In pipeline', color: 'text-blue-400' },
  { label: 'TOTAL MRR', value: '$75K', sub: '▲ +12%', color: 'text-emerald-400' },
  { label: 'AVG HEALTH', value: '81', sub: '0 at risk', color: 'text-white' },
  { label: 'WEALTH EVENTS', value: '3', sub: 'This week', color: 'text-[#C9A84C]', gold: true },
  { label: 'RENEWALS DUE', value: '1', sub: 'Within 60 days', color: 'text-amber-400', amber: true },
]

const WEALTH_FEED = [
  { client: 'Marcus Reid', event: 'Series C exit', amount: '$120M', type: 'exit' as const, time: '2 hours ago' },
  { client: 'Elizabeth Thornton', event: 'Estate transfer', amount: '$45M', type: 'inheritance' as const, time: '5 hours ago' },
  { client: 'Diana Walsh', event: 'Board appointment', amount: '', type: 'board' as const, time: '2 days ago' },
  { client: 'James Greenfield', event: 'IPO filing', amount: '', type: 'ipo' as const, time: '3 days ago' },
]

// ─── Helpers ─────────────────────────────────────────────────
const statusPill: Record<string, string> = {
  active: 'bg-emerald-900/50 text-emerald-400',
  prospect: 'bg-blue-900/50 text-blue-400',
  at_risk: 'bg-red-900/50 text-red-400',
  alumni: 'bg-purple-900/50 text-purple-400',
}

const tierBadge: Record<string, string> = {
  UHNW: 'border-[#C9A84C] text-[#C9A84C]',
  HNW: 'border-blue-400 text-blue-400',
}

const wealthEventPill: Record<string, string> = {
  exit: 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/40',
  inheritance: 'bg-purple-900/50 text-purple-400 border border-purple-500/40',
  board: 'bg-blue-900/50 text-blue-400 border border-blue-500/40',
  ipo: 'bg-blue-900/50 text-blue-400 border border-blue-500/40',
}

const wealthDot: Record<string, string> = {
  exit: 'bg-[#C9A84C]',
  inheritance: 'bg-purple-400',
  board: 'bg-blue-400',
  ipo: 'bg-emerald-400',
}

function contactColor(days: number): string {
  if (days < 0) return 'text-gray-500'
  if (days < 5) return 'text-emerald-400'
  if (days <= 10) return 'text-amber-400'
  return 'text-red-400'
}

function isAtRisk(c: Client): boolean {
  return c.status === 'active' && c.health !== null && c.health < 65
}

function hasRenewalSoon(c: Client): boolean {
  return c.renewalDays !== null && c.renewalDays <= 60
}

function getFilterCount(tab: FilterTab): number {
  switch (tab) {
    case 'all': return CLIENTS.length
    case 'active': return CLIENTS.filter(c => c.status === 'active').length
    case 'prospect': return CLIENTS.filter(c => c.status === 'prospect').length
    case 'at_risk': return CLIENTS.filter(c => isAtRisk(c)).length
    case 'renewal': return CLIENTS.filter(c => hasRenewalSoon(c)).length
    case 'wealth_event': return CLIENTS.filter(c => c.wealthEvent !== null).length
    case 'alumni': return CLIENTS.filter(c => c.status === 'alumni').length
  }
}

function filterClients(clients: Client[], tab: FilterTab, search: string, tierFilter: string, sort: string): Client[] {
  let list = [...clients]
  switch (tab) {
    case 'active': list = list.filter(c => c.status === 'active'); break
    case 'prospect': list = list.filter(c => c.status === 'prospect'); break
    case 'at_risk': list = list.filter(c => isAtRisk(c)); break
    case 'renewal': list = list.filter(c => hasRenewalSoon(c)); break
    case 'wealth_event': list = list.filter(c => c.wealthEvent !== null); break
    case 'alumni': list = list.filter(c => c.status === 'alumni'); break
  }
  if (search) {
    const q = search.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
  }
  if (tierFilter && tierFilter !== 'all') {
    list = list.filter(c => c.tier === tierFilter)
  }
  switch (sort) {
    case 'health_desc': list.sort((a, b) => (b.health ?? -1) - (a.health ?? -1)); break
    case 'health_asc': list.sort((a, b) => (a.health ?? 999) - (b.health ?? 999)); break
    case 'retainer': list.sort((a, b) => (b.retainer ?? b.retainerTarget ?? 0) - (a.retainer ?? a.retainerTarget ?? 0)); break
    case 'contact': list.sort((a, b) => (a.lastContactDays < 0 ? 999 : a.lastContactDays) - (b.lastContactDays < 0 ? 999 : b.lastContactDays)); break
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break
  }
  return list
}

// ─── Mock Brief ──────────────────────────────────────────────
const MOCK_BRIEF = {
  summary: 'Client relationship is strong with consistent engagement. Key pain points center around coordination complexity across multiple advisors and family members.',
  painSignals: [
    'Mentioned "overwhelmed by vendor coordination" in last call',
    'Three missed deadlines on property insurance renewals',
    'Spouse expressed frustration with information silos',
  ],
  opener: '"I noticed your team has been managing an increasing number of vendor relationships. I\'d love to walk through how our coordination framework has helped similar families reduce that overhead by 60%."',
  objections: [
    { obj: '"We already have a family office manager"', response: 'Acknowledge their team, position as augmentation not replacement. Reference Harrington case where we work alongside existing staff.' },
    { obj: '"The cost seems high for what we get"', response: 'Break down ROI: avg client saves 12 hours/week of principal time. At their billing rate, that\'s $15K/mo in recovered capacity.' },
  ],
  proofAssets: [
    'Harrington Dynasty case study (94 health score, similar pain profile)',
    'Family Office Coordination Benchmark Report 2026',
    'Client testimonial: Chen Family Office on vendor management',
  ],
}

// ─── Page Component ──────────────────────────────────────────
export default function ClientsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set())
  const [showBrief, setShowBrief] = useState(false)
  const [briefClient, setBriefClient] = useState<Client | null>(null)
  const [briefType, setBriefType] = useState('quick')
  const [briefContext, setBriefContext] = useState('')
  const [briefGenerated, setBriefGenerated] = useState(false)

  const filtered = filterClients(CLIENTS, activeTab, search, tierFilter, sort)

  const toggleCheck = (id: string) => {
    const next = new Set(checkedRows)
    next.has(id) ? next.delete(id) : next.add(id)
    setCheckedRows(next)
  }

  const openBrief = (c: Client) => {
    setBriefClient(c)
    setBriefGenerated(false)
    setBriefContext('')
    setBriefType('quick')
    setShowBrief(true)
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'prospect', label: 'Prospect' },
    { key: 'at_risk', label: 'At Risk' },
    { key: 'renewal', label: 'Renewal Due' },
    { key: 'wealth_event', label: 'Wealth Event' },
    { key: 'alumni', label: 'Alumni' },
  ]

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* ── TopBar ─────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {[['Dashboard','/dashboard'],['Discover','/discover'],['Offers','/offers'],['Clients','/clients'],['Playbooks','/playbooks'],['Deliver','/deliver']].map(([t,h]) => (
              <Link key={t} href={h as string} className={`px-3 py-4 text-sm ${t==='Clients'?'text-[#C9A84C] border-b-2 border-[#C9A84C]':'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer text-gray-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.268 21a2 2 0 003.464 0"/><path d="M3.262 15.326A1 1 0 004 17h16a1 1 0 00.74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 006 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#1e2a3a] px-3 py-1">
            <span className="text-sm">Ivan</span>
            <span className="text-[10px] bg-[#C9A84C]/20 text-[#C9A84C] px-1.5 rounded">ENTERPRISE</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-4">
        {/* ── KPI Strip ──────────────────────────────── */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {KPIS.map(k => (
            <div key={k.label} className={`bg-[#111827] border rounded-lg p-4 ${k.gold ? 'border-[#C9A84C]/40' : k.amber ? 'border-amber-500/40' : 'border-[#1e2a3a]'}`}>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{k.label}</div>
              <div className={`text-xl font-semibold mt-1 ${k.color}`}>{k.value}</div>
              <div className={`text-[11px] mt-1 ${k.gold ? 'text-[#C9A84C]' : k.amber ? 'text-amber-400' : k.sub.startsWith('▲') ? 'text-emerald-400' : 'text-gray-500'}`}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ────────────────────────────── */}
        <div className="flex gap-2 mb-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setSelectedClient(null) }}
              className={`text-xs px-3 py-1.5 rounded-lg ${activeTab === t.key ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]' : 'bg-[#111827] text-gray-400 border border-[#1e2a3a] hover:border-gray-600'}`}>
              {t.label} ({getFilterCount(t.key)})
            </button>
          ))}
        </div>

        {/* ── Toolbar ────────────────────────────────── */}
        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
            className="flex-1 max-w-xs bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm placeholder-gray-500 focus:border-[#C9A84C] focus:outline-none" />
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}
            className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
            <option value="all">All Tiers</option>
            <option value="UHNW">UHNW</option>
            <option value="HNW">HNW</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
            <option value="name">Sort: Name</option>
            <option value="health_desc">Sort: Health (High)</option>
            <option value="health_asc">Sort: Health (Low)</option>
            <option value="retainer">Sort: Retainer</option>
            <option value="contact">Sort: Last Contact</option>
          </select>
        </div>

        {/* ── 3-Column Layout ────────────────────────── */}
        <div className="flex gap-6">
          {/* Center: Table */}
          <div className="flex-1 min-w-0">
            <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0D1117]">
                    <th className="px-3 py-3 w-8"><input type="checkbox" className="accent-[#C9A84C]" /></th>
                    {['Client','Tier','Status','Pain Focus','Last Contact','Wealth Event','Health','KPIs','Retainer','Renewal','Channel','Actions'].map(h => (
                      <th key={h} className="text-[10px] uppercase tracking-wider text-gray-500 px-3 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className={`border-t border-[#1e2a3a] hover:bg-[#1e2a3a]/50 cursor-pointer ${selectedClient?.id === c.id ? 'bg-[#1e2a3a]/70' : ''}`}
                      onClick={() => setSelectedClient(selectedClient?.id === c.id ? null : c)}>
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={checkedRows.has(c.id)} onChange={() => toggleCheck(c.id)} className="accent-[#C9A84C]" />
                      </td>
                      {/* Client + Company + Trust Channel */}
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-[11px] text-gray-500">{c.company}</div>
                        <div className="text-[10px] text-purple-400">{c.trustChannel}</div>
                      </td>
                      {/* Tier */}
                      <td className="px-3 py-3"><JargonTooltip term={c.tier} bare><span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierBadge[c.tier]}`}>{c.tier}</span></JargonTooltip></td>
                      {/* Status */}
                      <td className="px-3 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${statusPill[isAtRisk(c) ? 'at_risk' : c.status]}`}>{isAtRisk(c) ? 'at risk' : c.status}</span></td>
                      {/* Pain Focus */}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.painFocus.map(p => <span key={p} className="text-[10px] bg-[#1e2a3a] text-gray-300 px-1.5 py-0.5 rounded">{p}</span>)}
                        </div>
                      </td>
                      {/* Last Contact */}
                      <td className={`px-3 py-3 text-xs whitespace-nowrap ${contactColor(c.lastContactDays)}`}>{c.lastContact}</td>
                      {/* Wealth Event */}
                      <td className="px-3 py-3">
                        {c.wealthEvent ? (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${wealthEventPill[c.wealthEvent.type!]}`}>{c.wealthEvent.label}</span>
                        ) : <span className="text-gray-600 text-xs">--</span>}
                      </td>
                      {/* Health + Trend */}
                      <td className="px-3 py-3">
                        {c.health !== null ? (
                          <span className={`text-sm font-semibold ${c.health > 80 ? 'text-emerald-400' : c.health > 65 ? 'text-amber-400' : 'text-red-400'}`}>
                            {c.health} {c.trend && <span className={`text-[10px] font-normal ${c.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{c.trend.startsWith('+') ? '\u2191' : '\u2193'}{c.trend}</span>}
                          </span>
                        ) : <span className="text-gray-600">--</span>}
                      </td>
                      {/* KPIs dots */}
                      <td className="px-3 py-3">
                        {c.kpiHit !== null ? (
                          <div className="flex gap-1">
                            {Array.from({ length: c.kpiTotal! }).map((_, i) => (
                              <span key={i} className={`w-2 h-2 rounded-full ${i < c.kpiHit! ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                            ))}
                          </div>
                        ) : <span className="text-gray-600">--</span>}
                      </td>
                      {/* Retainer */}
                      <td className="px-3 py-3 text-xs whitespace-nowrap">
                        {c.retainer ? <span className="text-white">${(c.retainer / 1000).toFixed(0)}K</span>
                          : c.retainerTarget ? <span className="text-blue-400">target ${(c.retainerTarget / 1000).toFixed(0)}K</span>
                          : <span className="text-gray-600">--</span>}
                      </td>
                      {/* Renewal */}
                      <td className="px-3 py-3 text-[11px] whitespace-nowrap">
                        {c.renewalDate ? (
                          <div>
                            <div className={c.renewalDays !== null && c.renewalDays <= 60 ? 'text-amber-400' : 'text-gray-400'}>{c.renewalDate}</div>
                            {c.renewalDays !== null && <div className="text-gray-600">{c.renewalDays}d</div>}
                          </div>
                        ) : <span className="text-gray-600">--</span>}
                      </td>
                      {/* Channel */}
                      <td className="px-3 py-3"><span className="text-[10px] text-purple-400 whitespace-nowrap">{c.channel}</span></td>
                      {/* Actions */}
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          {c.actions.map(a => {
                            let cls = 'text-[10px] px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80 whitespace-nowrap '
                            if (a === 'Intervene') cls += 'bg-red-900/50 text-red-400'
                            else if (a === 'Wealth event!') cls += 'bg-[#C9A84C]/20 text-[#C9A84C]'
                            else if (a === 'Decision Room') cls += 'bg-purple-900/50 text-purple-400'
                            else if (a === 'Brief') cls += 'bg-[#1e2a3a] text-gray-300'
                            else if (a === 'Upsell') cls += 'bg-emerald-900/50 text-emerald-400'
                            else if (a === 'Re-engage') cls += 'bg-amber-900/50 text-amber-400'
                            else if (a === 'Referral') cls += 'bg-blue-900/50 text-blue-400'
                            else cls += 'bg-[#1e2a3a] text-gray-400'
                            return <span key={a} className={cls} onClick={() => a === 'Brief' ? openBrief(c) : undefined}>{a}</span>
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center text-gray-500 py-8 text-sm">No clients match filters</div>}
            </div>
          </div>

          {/* ── Right Column (300px) ──────────────────── */}
          <div className="w-[300px] flex-shrink-0 space-y-4">
            {selectedClient ? (
              /* ── Client Detail Panel ────────────────── */
              <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-white text-xs mb-3">&larr; Back to overview</button>
                {/* Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 ${selectedClient.tier === 'UHNW' ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-blue-400 text-blue-400'} bg-[#0D1117]`}>
                    {selectedClient.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{selectedClient.name}</div>
                    <div className="text-[11px] text-gray-400">{selectedClient.company}</div>
                    <div className="flex gap-2 mt-1">
                      <JargonTooltip term={selectedClient.tier} bare><span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierBadge[selectedClient.tier]}`}>{selectedClient.tier}</span></JargonTooltip>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusPill[isAtRisk(selectedClient) ? 'at_risk' : selectedClient.status]}`}>{isAtRisk(selectedClient) ? 'at risk' : selectedClient.status}</span>
                    </div>
                  </div>
                </div>

                {/* Household Graph Preview */}
                <div className="bg-[#0D1117] rounded-lg border border-[#1e2a3a] p-3 mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">HOUSEHOLD GRAPH</div>
                  <div className="text-xs text-gray-400">4 people &middot; 3 vendors &middot; 2 properties</div>
                  <span className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer mt-1 inline-block">Open graph &rarr;</span>
                </div>

                {/* Detail Fields */}
                <div className="space-y-3 text-xs">
                  {selectedClient.health !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Health</span>
                      <span className={selectedClient.health > 80 ? 'text-emerald-400' : selectedClient.health > 65 ? 'text-amber-400' : 'text-red-400'}>
                        {selectedClient.health} {selectedClient.trend && <span>{selectedClient.trend.startsWith('+') ? '\u2191' : '\u2193'}{selectedClient.trend}</span>}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between"><span className="text-gray-500">Retainer</span><span>{selectedClient.retainer ? `$${(selectedClient.retainer/1000).toFixed(0)}K/mo` : selectedClient.retainerTarget ? `target $${(selectedClient.retainerTarget/1000).toFixed(0)}K` : '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Last Contact</span><span className={contactColor(selectedClient.lastContactDays)}>{selectedClient.lastContact}</span></div>
                  {selectedClient.renewalDate && <div className="flex justify-between"><span className="text-gray-500">Renewal</span><span className={selectedClient.renewalDays !== null && selectedClient.renewalDays <= 60 ? 'text-amber-400' : 'text-gray-300'}>{selectedClient.renewalDate}{selectedClient.renewalDays !== null ? ` (${selectedClient.renewalDays}d)` : ''}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Channel</span><span className="text-purple-400">{selectedClient.channel}</span></div>
                  <div className="flex justify-between items-start"><span className="text-gray-500">Pain Focus</span><div className="flex flex-wrap gap-1 justify-end">{selectedClient.painFocus.map(p => <span key={p} className="bg-[#1e2a3a] text-gray-300 px-1.5 py-0.5 rounded text-[10px]">{p}</span>)}</div></div>
                </div>

                {/* Wealth Event */}
                {selectedClient.wealthEvent && (
                  <div className={`mt-4 p-3 rounded-lg border ${selectedClient.wealthEvent.type === 'exit' ? 'border-[#C9A84C]/40 bg-[#C9A84C]/5' : selectedClient.wealthEvent.type === 'inheritance' ? 'border-purple-500/40 bg-purple-900/10' : 'border-blue-500/40 bg-blue-900/10'}`}>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">WEALTH EVENT</div>
                    <div className="text-sm font-medium">{selectedClient.wealthEvent.label}</div>
                  </div>
                )}

                {/* Recent Touchpoints */}
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">RECENT TOUCHPOINTS</div>
                  {selectedClient.touchpoints.map((tp, i) => (
                    <div key={i} className="flex items-start gap-2 py-2 border-b border-[#1e2a3a] last:border-0">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${tp.type === 'call' ? 'bg-emerald-400' : tp.type === 'email' ? 'bg-blue-400' : tp.type === 'review' ? 'bg-purple-400' : tp.type === 'alert' ? 'bg-red-400' : 'bg-[#C9A84C]'}`} />
                      <div>
                        <div className="text-xs text-gray-300">{tp.desc}</div>
                        <div className="text-[10px] text-gray-600">{tp.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <button onClick={() => openBrief(selectedClient)} className="w-full bg-[#C9A84C] text-[#0D1117] font-semibold py-2 rounded-lg text-sm hover:bg-[#C9A84C]/90">Generate Brief</button>
                  <button onClick={() => router.push(`/clients/${selectedClient.id}/decision-room`)} className="w-full bg-purple-900/50 text-purple-400 border border-purple-500/40 py-2 rounded-lg text-sm hover:bg-purple-900/70">Open Decision Room</button>
                  <button className="w-full border border-[#1e2a3a] text-gray-400 py-2 rounded-lg text-sm hover:border-gray-600">Log Touchpoint</button>
                  {isAtRisk(selectedClient) && <button className="w-full bg-red-900/50 text-red-400 border border-red-500/40 py-2 rounded-lg text-sm hover:bg-red-900/70">Schedule Intervention</button>}
                </div>
              </div>
            ) : (
              /* ── Default Right Column ───────────────── */
              <>
                {/* At Risk Panel */}
                <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">AT RISK</div>
                  {/* Wellington */}
                  <div className="border-l-2 border-red-500 pl-3 py-2 mb-3">
                    <div className="text-sm font-medium">Wellington Trust</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Health 62 &middot; No contact 12d</div>
                    <span className="text-[11px] text-red-400 hover:underline cursor-pointer mt-1 inline-block" onClick={() => setSelectedClient(CLIENTS[1])}>Intervene &rarr;</span>
                  </div>
                  {/* Thornton - alumni with wealth event */}
                  <div className="border-l-2 border-amber-500 pl-3 py-2">
                    <div className="text-sm font-medium">Elizabeth Thornton</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Alumni &middot; Inheritance event</div>
                    <span className="text-[11px] text-amber-400 hover:underline cursor-pointer mt-1 inline-block" onClick={() => setSelectedClient(CLIENTS[4])}>Re-engage &rarr;</span>
                  </div>
                </div>

                {/* Wealth Event Feed */}
                <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">WEALTH EVENTS</div>
                  {WEALTH_FEED.map((e, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[#1e2a3a] last:border-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${wealthDot[e.type]}`} />
                      <div className="flex-1">
                        <div className="text-xs text-gray-300"><span className="font-medium text-white">{e.client}</span> &middot; {e.event}{e.amount ? ` ${e.amount}` : ''}</div>
                        <div className="text-[10px] text-gray-600">{e.time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">QUICK STATS</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Avg Retainer</span><span className="text-[#C9A84C]">$23.3K</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Top Tier</span><span>UHNW (3)</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Longest Relationship</span><span className="text-emerald-400">Harrington</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Pre-Meeting Brief Modal ──────────────────── */}
      {showBrief && briefClient && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowBrief(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#111827] rounded-xl border border-[#1e2a3a] w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Pre-Meeting Brief</h2>
                  <div className="text-sm text-gray-400 mt-0.5">{briefClient.name} &middot; {briefClient.company}</div>
                </div>
                <button onClick={() => setShowBrief(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
              </div>

              {!briefGenerated ? (
                <div className="space-y-4">
                  {/* Brief Type */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">BRIEF TYPE</div>
                    <div className="flex gap-3">
                      {['quick', 'full', 'combined'].map(t => (
                        <label key={t} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${briefType === t ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]' : 'border-[#1e2a3a] text-gray-400 hover:border-gray-600'}`}>
                          <input type="radio" name="briefType" value={t} checked={briefType === t} onChange={() => setBriefType(t)} className="hidden" />
                          <span className="capitalize text-sm">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Meeting Context */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">MEETING CONTEXT</div>
                    <textarea value={briefContext} onChange={e => setBriefContext(e.target.value)}
                      placeholder="What is this meeting about? Any specific topics to cover..."
                      className="w-full bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:border-[#C9A84C] focus:outline-none h-24 resize-none" />
                  </div>

                  <button onClick={() => setBriefGenerated(true)} className="w-full bg-[#C9A84C] text-[#0D1117] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#C9A84C]/90">Generate Brief</button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Summary */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#C9A84C] mb-2">EXECUTIVE SUMMARY</div>
                    <p className="text-sm text-gray-300 leading-relaxed">{MOCK_BRIEF.summary}</p>
                  </div>

                  {/* Pain Signals */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-red-400 mb-2">PAIN SIGNALS DETECTED</div>
                    {MOCK_BRIEF.painSignals.map((s, i) => (
                      <div key={i} className="flex gap-2 py-1"><span className="text-red-400 mt-0.5">&#x25cf;</span><span className="text-sm text-gray-300">{s}</span></div>
                    ))}
                  </div>

                  {/* Conversation Opener */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">RECOMMENDED OPENER</div>
                    <div className="bg-[#0D1117] rounded-lg border border-emerald-900/50 p-3 text-sm text-emerald-300 italic">{MOCK_BRIEF.opener}</div>
                  </div>

                  {/* Objection Handling */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-400 mb-2">OBJECTION HANDLING</div>
                    {MOCK_BRIEF.objections.map((o, i) => (
                      <div key={i} className="mb-3">
                        <div className="text-sm font-medium text-amber-300">{o.obj}</div>
                        <div className="text-sm text-gray-400 mt-1 pl-3 border-l-2 border-amber-900/50">{o.response}</div>
                      </div>
                    ))}
                  </div>

                  {/* Proof Assets */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-blue-400 mb-2">PROOF ASSETS</div>
                    {MOCK_BRIEF.proofAssets.map((a, i) => (
                      <div key={i} className="flex gap-2 py-1"><span className="text-blue-400">&#x25b8;</span><span className="text-sm text-gray-300 hover:text-white cursor-pointer">{a}</span></div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setBriefGenerated(false)} className="flex-1 border border-[#1e2a3a] text-gray-400 py-2 rounded-lg text-sm hover:border-gray-600">Regenerate</button>
                    <button onClick={() => setShowBrief(false)} className="flex-1 bg-[#C9A84C] text-[#0D1117] font-semibold py-2 rounded-lg text-sm hover:bg-[#C9A84C]/90">Use Brief</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
