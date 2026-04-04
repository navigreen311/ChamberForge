'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────
type Status = 'delivered' | 'in_progress' | 'under_review' | 'overdue' | 'onboarding'
type Priority = 'critical' | 'high' | 'medium'
type TypeBadge = 'Quarterly Scorecard' | 'IR Plan' | 'Audit' | 'Monthly Report' | 'Assessment' | 'Training' | 'Onboarding'

interface Deliverable {
  id: string
  name: string
  type: TypeBadge
  client: string
  priority: Priority
  status: Status
  slaDue: string
  slaLabel: string
  slaColor: 'green' | 'amber' | 'red' | 'gray'
  assignee: string
  qaComplete: number
  qaTotal: number
  portalStatus: 'viewed' | 'activated' | 'not_activated' | 'none'
  integrationLabel?: string
  integrationColor?: string
}

interface Task {
  label: string
  priority: 'OVERDUE' | 'HIGH' | 'MEDIUM'
  due: string
  color: string
}

// ─── Inline Data ─────────────────────────────────────────────
const DELIVERABLES: Deliverable[] = [
  { id: '1', name: 'Q1 Scorecard', type: 'Quarterly Scorecard', client: 'Sarah Chen', priority: 'medium', status: 'delivered', slaDue: 'Mar 28', slaLabel: 'On time', slaColor: 'green', assignee: 'Ivan', qaComplete: 4, qaTotal: 4, portalStatus: 'viewed', integrationLabel: 'Rendered', integrationColor: 'bg-purple-900/50 text-purple-400' },
  { id: '2', name: 'Incident Response Plan', type: 'IR Plan', client: 'Wellington Trust', priority: 'critical', status: 'overdue', slaDue: 'Apr 1', slaLabel: '2d late', slaColor: 'red', assignee: 'Ivan', qaComplete: 1, qaTotal: 4, portalStatus: 'none' },
  { id: '3', name: 'Household Risk Audit', type: 'Audit', client: 'Harrington Dynasty', priority: 'high', status: 'delivered', slaDue: 'Mar 15', slaLabel: 'On time', slaColor: 'green', assignee: 'Ivan', qaComplete: 4, qaTotal: 4, portalStatus: 'viewed', integrationLabel: 'Rendered', integrationColor: 'bg-purple-900/50 text-purple-400' },
  { id: '4', name: 'Monthly Ops Report Mar', type: 'Monthly Report', client: 'Sarah Chen', priority: 'medium', status: 'delivered', slaDue: 'Mar 1', slaLabel: 'On time', slaColor: 'green', assignee: 'Ivan', qaComplete: 4, qaTotal: 4, portalStatus: 'viewed', integrationLabel: 'Sent to portal', integrationColor: 'bg-teal-900/50 text-teal-400' },
  { id: '5', name: 'Vendor Compliance Review', type: 'Audit', client: 'Harrington Dynasty', priority: 'high', status: 'under_review', slaDue: 'Apr 5', slaLabel: '1d', slaColor: 'amber', assignee: 'Ivan', qaComplete: 2, qaTotal: 4, portalStatus: 'activated', integrationLabel: 'Rendering', integrationColor: 'bg-amber-900/50 text-amber-400' },
  { id: '6', name: 'Cybersecurity Assessment', type: 'Assessment', client: 'Wellington Trust', priority: 'critical', status: 'in_progress', slaDue: 'Apr 8', slaLabel: '5d', slaColor: 'gray', assignee: 'Ivan', qaComplete: 0, qaTotal: 4, portalStatus: 'none' },
  { id: '7', name: 'Monthly Report Apr', type: 'Monthly Report', client: 'Thornton', priority: 'medium', status: 'overdue', slaDue: 'Apr 2', slaLabel: '1d late', slaColor: 'red', assignee: 'Ivan', qaComplete: 0, qaTotal: 4, portalStatus: 'none' },
  { id: '8', name: 'Staff Training Module', type: 'Training', client: 'Harrington Dynasty', priority: 'medium', status: 'in_progress', slaDue: 'Apr 12', slaLabel: '9d', slaColor: 'gray', assignee: 'Ivan', qaComplete: 1, qaTotal: 4, portalStatus: 'none', integrationLabel: 'VF: Scheduled', integrationColor: 'bg-blue-900/50 text-blue-400' },
  { id: '9', name: 'Privacy Footprint Audit', type: 'Audit', client: 'Reid', priority: 'high', status: 'in_progress', slaDue: 'Apr 15', slaLabel: '12d', slaColor: 'gray', assignee: 'Ivan', qaComplete: 0, qaTotal: 4, portalStatus: 'none' },
  { id: '10', name: 'Onboarding Package', type: 'Onboarding', client: 'Reid', priority: 'high', status: 'in_progress', slaDue: 'Apr 20', slaLabel: '17d', slaColor: 'gray', assignee: 'Ivan', qaComplete: 1, qaTotal: 4, portalStatus: 'none' },
]

const EXTRA_DELIVERED: Deliverable[] = [
  { id: '11', name: 'Insurance Gap Analysis', type: 'Audit', client: 'Thornton', priority: 'medium', status: 'delivered', slaDue: 'Feb 15', slaLabel: 'On time', slaColor: 'green', assignee: 'Ivan', qaComplete: 4, qaTotal: 4, portalStatus: 'viewed' },
  { id: '12', name: 'Annual Security Review', type: 'Assessment', client: 'Wellington Trust', priority: 'high', status: 'delivered', slaDue: 'Feb 28', slaLabel: 'On time', slaColor: 'green', assignee: 'Ivan', qaComplete: 4, qaTotal: 4, portalStatus: 'viewed', integrationLabel: 'Rendered', integrationColor: 'bg-purple-900/50 text-purple-400' },
  { id: '13', name: 'Q4 Scorecard', type: 'Quarterly Scorecard', client: 'Harrington Dynasty', priority: 'medium', status: 'delivered', slaDue: 'Jan 15', slaLabel: 'On time', slaColor: 'green', assignee: 'Ivan', qaComplete: 4, qaTotal: 4, portalStatus: 'viewed' },
  { id: '14', name: 'Onboarding Checklist', type: 'Onboarding', client: 'Reid', priority: 'high', status: 'in_progress', slaDue: 'Apr 25', slaLabel: '22d', slaColor: 'gray', assignee: 'Ivan', qaComplete: 0, qaTotal: 4, portalStatus: 'none' },
]

const ALL_DELIVERABLES = [...DELIVERABLES, ...EXTRA_DELIVERED]

const TASKS: Task[] = [
  { label: 'Wellington IR Plan', priority: 'OVERDUE', due: 'Apr 1', color: 'text-red-400' },
  { label: 'VoiceForge Training — Harrington', priority: 'HIGH', due: 'Tomorrow', color: 'text-amber-400' },
  { label: 'Chen Monthly Review', priority: 'MEDIUM', due: 'Apr 8', color: 'text-gray-400' },
  { label: 'Vendor audit followup', priority: 'MEDIUM', due: 'Apr 10', color: 'text-gray-400' },
  { label: 'Reid onboarding week 2', priority: 'MEDIUM', due: 'Apr 12', color: 'text-gray-400' },
]

const CLIENT_SLAS = [
  { name: 'Chen', pct: 100, color: 'bg-emerald-500' },
  { name: 'Harrington', pct: 90, color: 'bg-emerald-500' },
  { name: 'Wellington', pct: 60, color: 'bg-red-500' },
  { name: 'Reid', pct: 0, color: 'bg-gray-600', label: '—' },
  { name: 'Thornton', pct: 50, color: 'bg-red-500' },
]

const CLIENT_PORTALS = [
  { name: 'Chen', dot: 'bg-emerald-500', info: 'Login 1d ago · 4 deliverables · 0 unread' },
  { name: 'Harrington', dot: 'bg-emerald-500', info: 'Login 3d ago · 3 deliverables · 1 unread', unread: true },
  { name: 'Wellington', dot: 'bg-amber-500', info: 'Activated, no login' },
  { name: 'Reid', dot: 'bg-gray-600', info: 'Activate when onboarding complete' },
  { name: 'Thornton', dot: 'bg-gray-600', info: 'Not activated' },
]

const QA_ENGINE = [
  { label: 'SLA compliance', value: '2 failures', color: 'text-red-400' },
  { label: 'Onboarding quality', value: '75%', color: 'text-amber-400' },
  { label: 'Review cadence', value: 'Behind', color: 'text-amber-400' },
  { label: 'Proof assets', value: '4/6', color: 'text-gray-300' },
  { label: 'Portal usage', value: '2/5 active', color: 'text-gray-300' },
  { label: 'Escalation response', value: '18h', color: 'text-amber-400' },
]

const QA_CHECKLIST_ITEMS = [
  'Content reviewed & accurate',
  'SLA confirmed within window',
  'Portal ready for client access',
  'Proof asset generated',
]

// ─── Color Maps ──────────────────────────────────────────────
const statusPill: Record<Status, string> = {
  delivered: 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
  in_progress: 'bg-blue-900/50 text-blue-400 border-blue-800',
  under_review: 'bg-amber-900/50 text-amber-400 border-amber-800',
  overdue: 'bg-red-900/50 text-red-400 border-red-800',
  onboarding: 'bg-purple-900/50 text-purple-400 border-purple-800',
}
const statusLabel: Record<Status, string> = {
  delivered: 'Delivered', in_progress: 'In Progress', under_review: 'Under Review', overdue: 'Overdue', onboarding: 'Onboarding',
}
const priorityBadge: Record<Priority, string> = {
  critical: 'bg-red-900/50 text-red-400 border-red-800',
  high: 'bg-amber-900/50 text-amber-400 border-amber-800',
  medium: 'bg-gray-800 text-gray-400 border-gray-700',
}
const typeBadgeColor: Record<TypeBadge, string> = {
  'Quarterly Scorecard': 'bg-emerald-900/50 text-emerald-400',
  'IR Plan': 'bg-amber-900/50 text-amber-400',
  'Audit': 'bg-purple-900/50 text-purple-400',
  'Monthly Report': 'bg-blue-900/50 text-blue-400',
  'Assessment': 'bg-red-900/50 text-red-400',
  'Training': 'bg-[#C9A84C]/20 text-[#C9A84C]',
  'Onboarding': 'bg-gray-800 text-gray-300',
}
const slaTextColor: Record<string, string> = {
  green: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', gray: 'text-gray-400',
}

// ─── Filter Tabs ─────────────────────────────────────────────
type FilterTab = 'all' | 'delivered' | 'in_progress' | 'under_review' | 'overdue' | 'sla_risk' | 'onboarding'
const FILTER_TABS: { key: FilterTab; label: string; count: number; color?: string }[] = [
  { key: 'all', label: 'All', count: 14 },
  { key: 'delivered', label: 'Delivered', count: 6 },
  { key: 'in_progress', label: 'In Progress', count: 4 },
  { key: 'under_review', label: 'Under Review', count: 1 },
  { key: 'overdue', label: 'Overdue', count: 2, color: 'text-red-400' },
  { key: 'sla_risk', label: 'SLA at Risk', count: 1, color: 'text-amber-400' },
  { key: 'onboarding', label: 'Onboarding', count: 1 },
]

// ─── Nav Tabs ────────────────────────────────────────────────
const NAV_TABS: [string, string][] = [
  ['Dashboard', '/dashboard'], ['Discover', '/discover'], ['Offers', '/offers'],
  ['Clients', '/clients'], ['Playbooks', '/playbooks'], ['Deliver', '/deliver'],
]

// ─── Component ───────────────────────────────────────────────
export default function DeliverPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('sla')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [qaDrawerId, setQaDrawerId] = useState<string | null>(null)
  const [detailDrawerId, setDetailDrawerId] = useState<string | null>(null)
  const [qaChecked, setQaChecked] = useState<Record<string, Set<number>>>({})

  // ─── Filtering ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    let items = ALL_DELIVERABLES.filter(d => {
      if (activeTab === 'delivered') return d.status === 'delivered'
      if (activeTab === 'in_progress') return d.status === 'in_progress'
      if (activeTab === 'under_review') return d.status === 'under_review'
      if (activeTab === 'overdue') return d.status === 'overdue'
      if (activeTab === 'sla_risk') return d.slaColor === 'amber'
      if (activeTab === 'onboarding') return d.type === 'Onboarding'
      return true
    })
    if (search) items = items.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.client.toLowerCase().includes(search.toLowerCase()))
    if (clientFilter !== 'all') items = items.filter(d => d.client === clientFilter)
    if (typeFilter !== 'all') items = items.filter(d => d.type === typeFilter)
    if (priorityFilter !== 'all') items = items.filter(d => d.priority === priorityFilter)
    if (sortBy === 'sla') {
      const order: Record<string, number> = { red: 0, amber: 1, gray: 2, green: 3 }
      items.sort((a, b) => (order[a.slaColor] ?? 2) - (order[b.slaColor] ?? 2))
    } else if (sortBy === 'priority') {
      const order: Record<string, number> = { critical: 0, high: 1, medium: 2 }
      items.sort((a, b) => (order[a.priority] ?? 2) - (order[b.priority] ?? 2))
    } else if (sortBy === 'client') {
      items.sort((a, b) => a.client.localeCompare(b.client))
    }
    return items
  }, [activeTab, search, clientFilter, typeFilter, priorityFilter, sortBy])

  const toggleId = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }
  const toggleAllVisible = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(d => d.id)))
  }

  const toggleQaItem = (delivId: string, idx: number) => {
    const prev = qaChecked[delivId] ?? new Set<number>()
    const next = new Set(prev)
    next.has(idx) ? next.delete(idx) : next.add(idx)
    setQaChecked({ ...qaChecked, [delivId]: next })
  }
  const markAllQa = (delivId: string) => {
    setQaChecked({ ...qaChecked, [delivId]: new Set([0, 1, 2, 3]) })
  }

  const detailItem = ALL_DELIVERABLES.find(d => d.id === detailDrawerId)
  const qaItem = ALL_DELIVERABLES.find(d => d.id === qaDrawerId)
  const overdueItems = ALL_DELIVERABLES.filter(d => d.status === 'overdue')

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* ── TOP BAR ────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {NAV_TABS.map(([t, h]) => (
              <Link key={t} href={h} className={`px-3 py-4 text-sm ${t === 'Deliver' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Fulfillment OS</span>
          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-xs font-bold">IV</div>
        </div>
      </header>

      {/* ── KPI STRIP ──────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-3">
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'TOTAL DELIVERABLES', value: '14', sub: 'this quarter', color: 'text-white' },
            { label: 'SLA ADHERENCE', value: '88%', sub: '2 SLAs at risk', color: 'text-amber-400' },
            { label: 'OVERDUE', value: '2', sub: 'Immediate action', color: 'text-red-400' },
            { label: 'QA PASS RATE', value: '82%', sub: '▲ +5%', color: 'text-emerald-400' },
            { label: 'ACTIVE ONBOARDINGS', value: '1', sub: 'Marcus Reid', color: 'text-blue-400' },
            { label: 'ESCALATIONS OPEN', value: '1', sub: '', color: 'text-amber-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <p className="text-[10px] text-gray-500 tracking-wider mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              {k.sub && <p className="text-[10px] text-gray-500 mt-0.5">{k.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── SLA ALERT BAR ──────────────────────────────────── */}
      {overdueItems.length > 0 && (
        <div className="mx-6 mb-3 bg-red-950/60 border border-red-900/50 rounded-lg px-4 py-2.5 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-sm text-red-300 font-medium">{overdueItems.length} deliverables are overdue</span>
          <div className="flex gap-2 ml-2">
            {overdueItems.map(d => (
              <span key={d.id} className="px-2 py-0.5 bg-red-900/50 border border-red-800 rounded text-xs text-red-400">
                {d.client} &middot; {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTER TABS ────────────────────────────────────── */}
      <div className="px-6 mb-3">
        <div className="flex gap-1 border-b border-[#1e2a3a]">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm border-b-2 transition-colors ${activeTab === tab.key ? 'text-[#C9A84C] border-[#C9A84C]' : 'text-gray-400 hover:text-white border-transparent'}`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${tab.color ?? 'text-gray-500'}`}>({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ────────────────────────────────────────── */}
      <div className="px-6 mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search deliverables..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 w-56 focus:outline-none focus:border-[#C9A84C]"
        />
        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300">
          <option value="all">All Clients</option>
          {['Sarah Chen', 'Wellington Trust', 'Harrington Dynasty', 'Reid', 'Thornton'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300">
          <option value="all">All Types</option>
          {['Quarterly Scorecard', 'IR Plan', 'Audit', 'Monthly Report', 'Assessment', 'Training', 'Onboarding'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300">
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-1.5 text-sm text-gray-300">
          <option value="sla">Sort: SLA urgency</option>
          <option value="priority">Sort: Priority</option>
          <option value="client">Sort: Client</option>
        </select>
        {selectedIds.size > 0 && (
          <span className="ml-auto text-xs text-gray-400">{selectedIds.size} selected</span>
        )}
      </div>

      {/* ── 3-COLUMN LAYOUT ────────────────────────────────── */}
      <div className="px-6 pb-8 flex gap-4">
        {/* ── CENTER: TABLE ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a3a] text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="p-3 w-8"><input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAllVisible} className="accent-[#C9A84C]" /></th>
                  <th className="p-3 text-left">Deliverable</th>
                  <th className="p-3 text-left">Client</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">SLA Due</th>
                  <th className="p-3 text-left">Assignee</th>
                  <th className="p-3 text-center">QA</th>
                  <th className="p-3 text-center">Portal</th>
                  <th className="p-3 text-center">Integration</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr
                    key={d.id}
                    onClick={() => setDetailDrawerId(d.id)}
                    className={`border-b border-[#1e2a3a] hover:bg-[#1a2332] cursor-pointer transition-colors ${d.status === 'overdue' ? 'bg-red-950/20' : ''}`}
                  >
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggleId(d.id)} className="accent-[#C9A84C]" />
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-white text-sm">{d.name}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] ${typeBadgeColor[d.type]}`}>{d.type}</span>
                    </td>
                    <td className="p-3 text-gray-300">{d.client}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${priorityBadge[d.priority]}`}>{d.priority}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs border ${statusPill[d.status]}`}>{statusLabel[d.status]}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-sm ${slaTextColor[d.slaColor]}`}>{d.slaDue}</span>
                      <span className={`ml-1 text-[10px] ${slaTextColor[d.slaColor]}`}>&middot; {d.slaLabel}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-[10px] font-bold">IV</div>
                        <span className="text-gray-300 text-xs">{d.assignee}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center" onClick={e => { e.stopPropagation(); setQaDrawerId(d.id) }}>
                      <div className="flex items-center justify-center gap-0.5 cursor-pointer">
                        {Array.from({ length: d.qaTotal }).map((_, i) => (
                          <span key={i} className={`w-2 h-2 rounded-full ${i < d.qaComplete ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                        ))}
                        {d.qaComplete === d.qaTotal && d.qaTotal > 0 && <span className="ml-1 text-emerald-400 text-[10px]">&#10003;</span>}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${d.portalStatus === 'viewed' ? 'bg-emerald-500' : d.portalStatus === 'activated' ? 'bg-amber-500' : 'bg-gray-600'}`} />
                    </td>
                    <td className="p-3 text-center">
                      {d.integrationLabel ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] ${d.integrationColor}`}>{d.integrationLabel}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setDetailDrawerId(d.id)} className="px-2 py-0.5 text-[10px] bg-[#1e2a3a] text-gray-300 rounded hover:bg-[#263345]">View</button>
                        {d.status === 'overdue' && (
                          <button className="px-2 py-0.5 text-[10px] bg-red-900/50 text-red-400 rounded hover:bg-red-900/80">Escalate</button>
                        )}
                        {d.status === 'under_review' && (
                          <>
                            <button className="px-2 py-0.5 text-[10px] bg-emerald-900/50 text-emerald-400 rounded hover:bg-emerald-900/80">Approve</button>
                            <button className="px-2 py-0.5 text-[10px] bg-amber-900/50 text-amber-400 rounded hover:bg-amber-900/80">Revise</button>
                          </>
                        )}
                        {d.status === 'in_progress' && d.type === 'Assessment' && (
                          <button className="px-2 py-0.5 text-[10px] bg-blue-900/50 text-blue-400 rounded hover:bg-blue-900/80">QA check</button>
                        )}
                        {d.status === 'in_progress' && d.integrationLabel?.startsWith('VF') && (
                          <button className="px-2 py-0.5 text-[10px] bg-purple-900/50 text-purple-400 rounded hover:bg-purple-900/80">VoiceForge</button>
                        )}
                        {d.status === 'delivered' && d.qaComplete === d.qaTotal && (
                          <button className="px-2 py-0.5 text-[10px] bg-gray-800 text-gray-400 rounded hover:bg-gray-700">Proof</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-sm">No deliverables match current filters</div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ───────────────────────────────── */}
        <div className="w-[300px] flex-shrink-0 space-y-4">
          {/* SLA Monitor */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">SLA Monitor</h3>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Overall</span>
                <span className="text-amber-400 font-medium">88%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
            <div className="space-y-2">
              {CLIENT_SLAS.map(c => (
                <div key={c.name}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-gray-400">{c.name}</span>
                    <span className={c.pct === 0 ? 'text-gray-500' : c.pct >= 80 ? 'text-emerald-400' : 'text-red-400'}>{c.label ?? `${c.pct}%`}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className={`${c.color} h-1.5 rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Panel */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tasks</h3>
            <div className="space-y-2">
              {TASKS.map((t, i) => (
                <div key={i} className={`flex items-center justify-between py-1.5 ${i < TASKS.length - 1 ? 'border-b border-[#1e2a3a]' : ''}`}>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-200 truncate">{t.label}</p>
                    <p className="text-[10px] text-gray-500">{t.due}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[10px] rounded ${t.priority === 'OVERDUE' ? 'bg-red-900/50 text-red-400' : t.priority === 'HIGH' ? 'bg-amber-900/50 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Onboarding Pipeline */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Onboarding Pipeline</h3>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-white">Marcus Reid</span>
                <span className="text-[10px] text-[#C9A84C]">25%</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-2">Week 2 of 8 &middot; Household Graph Setup</p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#C9A84C] h-2 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>

          {/* Client Portals */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Client Portals</h3>
            <div className="space-y-2">
              {CLIENT_PORTALS.map(p => (
                <div key={p.name} className="flex items-start gap-2">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-200">{p.name}</p>
                    <p className="text-[10px] text-gray-500">{p.info}
                      {p.unread && <span className="ml-1 text-[#C9A84C] font-medium">&#9679;</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation Log */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Escalation Log</h3>
            <div className="flex items-start gap-2">
              <span className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-xs text-gray-300">
                <span className="text-red-400 font-medium">SLA breach:</span> Wellington Trust Incident Response Plan — auto-escalated 2d ago
              </p>
            </div>
          </div>

          {/* QA Engine */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
            <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">QA Engine</h3>
            <div className="space-y-2">
              {QA_ENGINE.map(q => (
                <div key={q.label} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{q.label}</span>
                  <span className={`text-xs font-medium ${q.color}`}>{q.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── QA CHECKLIST DRAWER ─────────────────────────────── */}
      {qaDrawerId && qaItem && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setQaDrawerId(null)} />
          <div className="fixed right-0 top-0 h-full w-[480px] bg-[#111827] border-l border-[#1e2a3a] z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">QA Checklist</h2>
                <button onClick={() => setQaDrawerId(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-white font-medium">{qaItem.name}</p>
                <p className="text-xs text-gray-400">{qaItem.client} &middot; {qaItem.type}</p>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-300">Progress:</span>
                  <span className={`text-sm font-medium ${(qaChecked[qaItem.id]?.size ?? qaItem.qaComplete) === qaItem.qaTotal ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {qaChecked[qaItem.id]?.size ?? qaItem.qaComplete}/{qaItem.qaTotal}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${((qaChecked[qaItem.id]?.size ?? qaItem.qaComplete) / qaItem.qaTotal) * 100}%` }} />
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {QA_CHECKLIST_ITEMS.map((item, idx) => {
                  const checked = qaChecked[qaItem.id]?.has(idx) ?? idx < qaItem.qaComplete
                  return (
                    <label key={idx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-[#0D1117] border-[#1e2a3a] hover:border-gray-600'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleQaItem(qaItem.id, idx)} className="accent-emerald-500" />
                      <span className={`text-sm ${checked ? 'text-emerald-400 line-through' : 'text-gray-300'}`}>{item}</span>
                    </label>
                  )
                })}
              </div>
              <button onClick={() => markAllQa(qaItem.id)} className="w-full py-2.5 bg-[#C9A84C] text-[#0D1117] font-semibold rounded-lg text-sm hover:bg-[#d4b35a] transition-colors">
                Mark all complete
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── DELIVERABLE DETAIL DRAWER ──────────────────────── */}
      {detailDrawerId && detailItem && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDetailDrawerId(null)} />
          <div className="fixed right-0 top-0 h-full w-[600px] bg-[#111827] border-l border-[#1e2a3a] z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{detailItem.name}</h2>
                <button onClick={() => setDetailDrawerId(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-2 py-0.5 rounded text-xs ${typeBadgeColor[detailItem.type]}`}>{detailItem.type}</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${statusPill[detailItem.status]}`}>{statusLabel[detailItem.status]}</span>
                <span className={`px-2 py-0.5 rounded text-xs border ${priorityBadge[detailItem.priority]}`}>{detailItem.priority}</span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Client</p>
                  <p className="text-sm text-white">{detailItem.client}</p>
                </div>
                <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 mb-1">SLA Due</p>
                  <p className={`text-sm ${slaTextColor[detailItem.slaColor]}`}>{detailItem.slaDue} &middot; {detailItem.slaLabel}</p>
                </div>
                <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Assignee</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] text-[8px] font-bold">IV</div>
                    <span className="text-sm text-white">{detailItem.assignee}</span>
                  </div>
                </div>
                <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Portal Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${detailItem.portalStatus === 'viewed' ? 'bg-emerald-500' : detailItem.portalStatus === 'activated' ? 'bg-amber-500' : 'bg-gray-600'}`} />
                    <span className="text-sm text-gray-300 capitalize">{detailItem.portalStatus.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* QA Checklist */}
              <div className="mb-6">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">QA Checklist</h3>
                <div className="space-y-2">
                  {QA_CHECKLIST_ITEMS.map((item, idx) => {
                    const checked = qaChecked[detailItem.id]?.has(idx) ?? idx < detailItem.qaComplete
                    return (
                      <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => toggleQaItem(detailItem.id, idx)} className="accent-emerald-500" />
                        <span className={checked ? 'text-emerald-400 line-through' : 'text-gray-300'}>{item}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Revision History */}
              <div className="mb-6">
                <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Revision History</h3>
                <div className="space-y-2">
                  {[
                    { date: 'Mar 25', action: 'Draft created by Ivan', color: 'bg-blue-500' },
                    { date: 'Mar 27', action: 'QA review completed — 2 items flagged', color: 'bg-amber-500' },
                    { date: 'Mar 28', action: 'Final version approved & delivered', color: 'bg-emerald-500' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`w-2 h-2 rounded-full ${r.color} mt-1.5`} />
                        {i < 2 && <span className="w-px h-4 bg-[#1e2a3a]" />}
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">{r.action}</p>
                        <p className="text-[10px] text-gray-500">{r.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VisionAudio Status */}
              {detailItem.integrationLabel && (
                <div className="mb-6">
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">VisionAudio / VoiceForge</h3>
                  <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${detailItem.integrationColor}`}>{detailItem.integrationLabel}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button className="px-4 py-2 bg-[#C9A84C] text-[#0D1117] font-semibold rounded-lg text-sm hover:bg-[#d4b35a] transition-colors">
                  Generate proof
                </button>
                <button className="px-4 py-2 bg-emerald-900/50 text-emerald-400 border border-emerald-800 rounded-lg text-sm hover:bg-emerald-900/80 transition-colors">
                  Mark delivered
                </button>
                <button className="px-4 py-2 bg-red-900/50 text-red-400 border border-red-800 rounded-lg text-sm hover:bg-red-900/80 transition-colors">
                  Escalate
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}