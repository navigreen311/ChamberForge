'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────
type Tier = 'HNW' | 'UHNW'
type Lifecycle = 'Emerging' | 'Accelerating' | 'Proven'
type DeliveryModel = 'Orchestrated' | 'Team' | 'Tech-Assisted' | 'Solo'
type RedTeamStatus = 'Passed' | 'Failed' | 'Not audited'
type Category = 'Security' | 'Coordination' | 'Governance' | 'Privacy' | 'Medical' | 'Travel' | 'Property'
type FilterTab = 'all' | 'templates' | 'active' | 'custom' | 'composites' | 'redteam'
type ViewMode = 'cards' | 'list'

interface Playbook {
  id: number
  slug: string
  name: string
  price: string
  pricingModel: string
  tier: Tier
  lifecycle: Lifecycle
  deliveryModel: DeliveryModel
  redTeam: RedTeamStatus
  activeClients: number
  evidence: number
  wtp: number
  activationTime: string
  kpisDefined: string
  readiness: number
  integrations: { vf: boolean; va: boolean; dd: boolean; tp: boolean }
  category: Category
  accentColor: string
  buyer: string
  pain: string
  isCustom: boolean
  isComposite: boolean
  included: { label: string; done: boolean }[]
  citations: { source: string; credibility: number }[]
  compatible: string[]
}

// ─── Inline Data ─────────────────────────────────────────────
const PLAYBOOKS: Playbook[] = [
  {
    id: 1, slug: 'private-ops-office', name: 'Private Ops Office',
    price: '$15-30K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Accelerating',
    deliveryModel: 'Orchestrated', redTeam: 'Passed', activeClients: 3,
    evidence: 8.2, wtp: 7.9, activationTime: '38min', kpisDefined: '4/4', readiness: 95,
    integrations: { vf: true, va: true, dd: true, tp: true },
    category: 'Coordination', accentColor: 'bg-teal-500',
    buyer: 'Newly wealthy founders & executives', pain: 'Coordination overload across vendors, advisors, and household staff',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Dedicated ops coordinator', done: true }, { label: 'Vendor management portal', done: true },
      { label: 'Weekly status briefings', done: true }, { label: 'Crisis escalation protocol', done: true },
      { label: 'Calendar orchestration', done: true }, { label: 'Expense tracking dashboard', done: true },
      { label: 'Staff vetting pipeline', done: true }, { label: 'Document vault access', done: true },
      { label: 'Travel coordination add-on', done: false }, { label: 'Medical liaison service', done: false },
    ],
    citations: [
      { source: 'McKinsey Family Office Report 2024', credibility: 92 },
      { source: 'UBS Global Wealth Survey', credibility: 88 },
      { source: 'ChamberForge Client Interviews (n=15)', credibility: 85 },
    ],
    compatible: ['Ecosystem Orchestrator', 'Household Workforce', 'Travel Reliability'],
  },
  {
    id: 2, slug: 'ecosystem-orchestrator', name: 'Ecosystem Orchestrator',
    price: '$20-40K/mo', pricingModel: 'Monthly retainer', tier: 'UHNW', lifecycle: 'Proven',
    deliveryModel: 'Orchestrated', redTeam: 'Passed', activeClients: 2,
    evidence: 8.5, wtp: 8.1, activationTime: '45min', kpisDefined: '4/4', readiness: 100,
    integrations: { vf: true, va: true, dd: true, tp: true },
    category: 'Coordination', accentColor: 'bg-teal-500',
    buyer: 'Multi-residence UHNW families', pain: 'Fragmented vendor stack across geographies and properties',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Multi-property coordination hub', done: true }, { label: 'Vendor scoring & selection', done: true },
      { label: 'Cross-geography compliance', done: true }, { label: 'Quarterly strategic reviews', done: true },
      { label: 'Real-time vendor dashboards', done: true }, { label: 'SLA enforcement engine', done: true },
      { label: 'Budget consolidation reports', done: true }, { label: 'Emergency response network', done: true },
      { label: 'Insurance coordination layer', done: true }, { label: 'Next-gen onboarding module', done: true },
    ],
    citations: [
      { source: 'Deloitte Family Enterprise Survey 2024', credibility: 94 },
      { source: 'Campden Wealth Global Report', credibility: 91 },
      { source: 'ChamberForge Pilot Data (n=8)', credibility: 82 },
    ],
    compatible: ['Private Ops Office', 'Family Risk Council', 'Property Resilience'],
  },
  {
    id: 3, slug: 'family-cyber-command', name: 'Family Cyber Command',
    price: '$10-25K/mo', pricingModel: 'Monthly retainer', tier: 'UHNW', lifecycle: 'Emerging',
    deliveryModel: 'Team', redTeam: 'Failed', activeClients: 1,
    evidence: 9.0, wtp: 8.7, activationTime: '52min', kpisDefined: '3/4', readiness: 72,
    integrations: { vf: true, va: false, dd: true, tp: false },
    category: 'Security', accentColor: 'bg-red-500',
    buyer: 'Family offices & public-facing executives', pain: 'AI voice cloning, wire fraud, impersonation attacks',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Threat monitoring dashboard', done: true }, { label: 'AI impersonation detection', done: true },
      { label: 'Wire fraud prevention protocol', done: true }, { label: 'Family device hardening', done: true },
      { label: 'Dark web scanning', done: true }, { label: 'Incident response team', done: true },
      { label: 'Staff security training', done: true }, { label: 'Penetration testing quarterly', done: false },
      { label: 'Insurance claims support', done: false }, { label: 'Legal liaison for breaches', done: false },
    ],
    citations: [
      { source: 'FBI IC3 Annual Report 2024', credibility: 97 },
      { source: 'Mandiant Threat Intelligence Brief', credibility: 93 },
      { source: 'Aon Cyber Risk Survey (UHNW)', credibility: 89 },
    ],
    compatible: ['Footprint Reduction', 'Family Risk Council'],
  },
  {
    id: 4, slug: 'footprint-reduction', name: 'Footprint Reduction',
    price: '$8-18K/mo', pricingModel: 'Monthly retainer', tier: 'UHNW', lifecycle: 'Proven',
    deliveryModel: 'Tech-Assisted', redTeam: 'Passed', activeClients: 0,
    evidence: 7.8, wtp: 7.2, activationTime: '30min', kpisDefined: '4/4', readiness: 88,
    integrations: { vf: false, va: true, dd: true, tp: true },
    category: 'Privacy', accentColor: 'bg-amber-500',
    buyer: 'Public-facing executives & celebrities', pain: 'Data broker exposure, doxxing risk, open-source intel vulnerability',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Data broker removal service', done: true }, { label: 'OSINT vulnerability audit', done: true },
      { label: 'Social media hygiene review', done: true }, { label: 'Property record obscuration', done: true },
      { label: 'Ongoing monitoring dashboard', done: true }, { label: 'Family member scan', done: true },
      { label: 'Court record sealing support', done: true }, { label: 'Digital alias management', done: true },
      { label: 'VPN & encrypted comms setup', done: true }, { label: 'Annual re-assessment', done: false },
    ],
    citations: [
      { source: 'FTC Data Broker Report 2024', credibility: 95 },
      { source: 'Privacy Rights Clearinghouse Study', credibility: 87 },
      { source: 'ChamberForge Internal Analysis', credibility: 80 },
    ],
    compatible: ['Family Cyber Command', 'Travel Reliability'],
  },
  {
    id: 5, slug: 'household-workforce', name: 'Household Workforce',
    price: '$12-22K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Accelerating',
    deliveryModel: 'Team', redTeam: 'Not audited', activeClients: 0,
    evidence: 7.1, wtp: 6.8, activationTime: '40min', kpisDefined: '2/4', readiness: 65,
    integrations: { vf: false, va: false, dd: true, tp: false },
    category: 'Coordination', accentColor: 'bg-teal-500',
    buyer: 'Principals with 5+ household staff', pain: 'Insider risk, vetting gaps, staff turnover, compliance blind spots',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Staff vetting & background checks', done: true }, { label: 'NDA & contract management', done: true },
      { label: 'Performance review framework', done: true }, { label: 'Payroll compliance audit', done: true },
      { label: 'Training program design', done: true }, { label: 'Exit protocol & asset recovery', done: false },
      { label: 'Workers comp management', done: false }, { label: 'Succession planning for roles', done: false },
      { label: 'Cultural sensitivity training', done: false }, { label: 'Holiday & absence tracking', done: false },
    ],
    citations: [
      { source: 'Housekeeper.com Industry Report', credibility: 72 },
      { source: 'Staffing Industry Analysts (SIA)', credibility: 78 },
      { source: 'ChamberForge Client Survey (n=6)', credibility: 68 },
    ],
    compatible: ['Private Ops Office', 'Ecosystem Orchestrator'],
  },
  {
    id: 6, slug: 'family-risk-council', name: 'Family Risk Council',
    price: '$15-35K/qtr', pricingModel: 'Quarterly engagement', tier: 'UHNW', lifecycle: 'Accelerating',
    deliveryModel: 'Orchestrated', redTeam: 'Passed', activeClients: 1,
    evidence: 8.0, wtp: 7.5, activationTime: '55min', kpisDefined: '4/4', readiness: 90,
    integrations: { vf: true, va: true, dd: true, tp: true },
    category: 'Governance', accentColor: 'bg-purple-500',
    buyer: 'Investment-focused family offices', pain: 'Non-investment risk underbuilt — reputation, cyber, physical, legal',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Quarterly risk assessment', done: true }, { label: 'Board-ready risk report', done: true },
      { label: 'Cross-domain risk matrix', done: true }, { label: 'Scenario planning sessions', done: true },
      { label: 'Regulatory change monitoring', done: true }, { label: 'Insurance gap analysis', done: true },
      { label: 'Vendor risk scoring', done: true }, { label: 'Succession risk mapping', done: true },
      { label: 'Geopolitical exposure brief', done: true }, { label: 'Annual strategic risk offsite', done: false },
    ],
    citations: [
      { source: 'EY Global Family Office Report', credibility: 93 },
      { source: 'WEF Global Risks Report 2025', credibility: 96 },
      { source: 'Institute for Family Governance', credibility: 84 },
    ],
    compatible: ['Family Cyber Command', 'Ecosystem Orchestrator', 'Next-Gen Studio'],
  },
  {
    id: 7, slug: 'next-gen-studio', name: 'Next-Gen Studio',
    price: '$25-60K', pricingModel: 'Project-based', tier: 'UHNW', lifecycle: 'Emerging',
    deliveryModel: 'Orchestrated', redTeam: 'Not audited', activeClients: 0,
    evidence: 7.5, wtp: 7.0, activationTime: '60min', kpisDefined: '1/4', readiness: 55,
    integrations: { vf: false, va: true, dd: false, tp: false },
    category: 'Governance', accentColor: 'bg-purple-500',
    buyer: 'Multigenerational wealth families', pain: 'Succession conflict, next-gen disengagement, values misalignment',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Next-gen readiness assessment', done: true }, { label: 'Family governance workshop', done: true },
      { label: 'Values alignment session', done: true }, { label: 'Leadership development plan', done: false },
      { label: 'Mentorship matching program', done: false }, { label: 'Communication framework', done: false },
      { label: 'Decision-rights mapping', done: false }, { label: 'Philanthropy strategy module', done: false },
      { label: 'Family constitution draft', done: false }, { label: 'Annual family assembly plan', done: false },
    ],
    citations: [
      { source: 'Merrill Lynch Wealth Transfer Study', credibility: 90 },
      { source: 'Williams Group Generational Wealth', credibility: 86 },
      { source: 'Family Business Review Journal', credibility: 83 },
    ],
    compatible: ['Family Risk Council', 'Ecosystem Orchestrator'],
  },
  {
    id: 8, slug: 'medical-navigation', name: 'Medical Navigation',
    price: '$8-20K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Emerging',
    deliveryModel: 'Solo', redTeam: 'Passed', activeClients: 0,
    evidence: 6.5, wtp: 6.2, activationTime: '25min', kpisDefined: '3/4', readiness: 80,
    integrations: { vf: false, va: false, dd: true, tp: true },
    category: 'Medical', accentColor: 'bg-green-500',
    buyer: 'UHNW health-focused individuals & families', pain: 'Fragmented medical records, second-opinion logistics, global care coordination',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Medical records consolidation', done: true }, { label: 'Second opinion coordination', done: true },
      { label: 'Global specialist network', done: true }, { label: 'Emergency medical protocol', done: true },
      { label: 'Family health dashboard', done: true }, { label: 'Preventive care scheduling', done: true },
      { label: 'Insurance claims advocacy', done: true }, { label: 'Mental health resource network', done: false },
      { label: 'Medical travel coordination', done: false }, { label: 'End-of-life planning support', done: false },
    ],
    citations: [
      { source: 'WHO Global Health Observatory', credibility: 91 },
      { source: 'Concierge Medicine Today Report', credibility: 79 },
      { source: 'ChamberForge Pilot Feedback (n=4)', credibility: 71 },
    ],
    compatible: ['Travel Reliability', 'Private Ops Office'],
  },
  {
    id: 9, slug: 'property-resilience', name: 'Property Resilience',
    price: '$10-20K/yr', pricingModel: 'Annual subscription', tier: 'HNW', lifecycle: 'Proven',
    deliveryModel: 'Solo', redTeam: 'Passed', activeClients: 1,
    evidence: 7.2, wtp: 6.8, activationTime: '20min', kpisDefined: '4/4', readiness: 92,
    integrations: { vf: false, va: false, dd: true, tp: true },
    category: 'Property', accentColor: 'bg-orange-500',
    buyer: 'High-value property owners (3+ residences)', pain: 'Insurance gaps, climate exposure, maintenance blind spots',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Multi-property risk audit', done: true }, { label: 'Insurance coverage gap analysis', done: true },
      { label: 'Climate exposure assessment', done: true }, { label: 'Maintenance scheduling system', done: true },
      { label: 'Vendor coordination per property', done: true }, { label: 'Smart home security review', done: true },
      { label: 'Property value tracking', done: true }, { label: 'Emergency response playbook', done: true },
      { label: 'Renovation project oversight', done: true }, { label: 'Art & collectibles protection', done: false },
    ],
    citations: [
      { source: 'Swiss Re Climate Risk Report', credibility: 94 },
      { source: 'Knight Frank Wealth Report 2024', credibility: 90 },
      { source: 'AIG Private Client Group Data', credibility: 87 },
    ],
    compatible: ['Ecosystem Orchestrator', 'Family Risk Council'],
  },
  {
    id: 10, slug: 'travel-reliability', name: 'Travel Reliability',
    price: '$6-15K/mo', pricingModel: 'Monthly retainer', tier: 'HNW', lifecycle: 'Accelerating',
    deliveryModel: 'Solo', redTeam: 'Failed', activeClients: 0,
    evidence: 6.8, wtp: 6.5, activationTime: '22min', kpisDefined: '2/4', readiness: 60,
    integrations: { vf: false, va: false, dd: false, tp: false },
    category: 'Travel', accentColor: 'bg-blue-500',
    buyer: 'Frequent multi-generational travelers', pain: 'Disruption, logistics gaps, medical emergencies abroad, security threats',
    isCustom: false, isComposite: false,
    included: [
      { label: 'Itinerary risk assessment', done: true }, { label: 'Real-time travel monitoring', done: true },
      { label: 'Emergency evacuation protocol', done: true }, { label: 'Medical support abroad', done: true },
      { label: 'Security advance work', done: false }, { label: 'Private aviation coordination', done: false },
      { label: 'Destination intelligence briefs', done: false }, { label: 'Family tracking dashboard', done: false },
      { label: 'Insurance claims while traveling', done: false }, { label: 'Multi-timezone scheduling', done: false },
    ],
    citations: [
      { source: 'ISOS Travel Risk Report 2024', credibility: 88 },
      { source: 'Global Rescue Incident Data', credibility: 84 },
      { source: 'ChamberForge Market Interviews (n=10)', credibility: 76 },
    ],
    compatible: ['Private Ops Office', 'Footprint Reduction', 'Medical Navigation'],
  },
]

const CATEGORY_COLORS: Record<Category, string> = {
  Security: 'bg-red-500', Coordination: 'bg-teal-500', Governance: 'bg-purple-500',
  Privacy: 'bg-amber-500', Medical: 'bg-green-500', Travel: 'bg-blue-500', Property: 'bg-orange-500',
}

const LIFECYCLE_COLORS: Record<Lifecycle, string> = {
  Emerging: 'bg-blue-900/50 text-blue-400 border-blue-700',
  Accelerating: 'bg-green-900/50 text-green-400 border-green-700',
  Proven: 'bg-purple-900/50 text-purple-400 border-purple-700',
}

const NAV_TABS = [
  ['Dashboard', '/dashboard'], ['Discover', '/discover'], ['Offers', '/offers'],
  ['Clients', '/clients'], ['Playbooks', '/playbooks'], ['Deliver', '/deliver'],
]

const FILTER_TABS: { key: FilterTab; label: string; count: number; badge?: string }[] = [
  { key: 'all', label: 'All', count: 12 },
  { key: 'templates', label: 'Templates', count: 10 },
  { key: 'active', label: 'Active', count: 5 },
  { key: 'custom', label: 'Custom', count: 2 },
  { key: 'composites', label: 'Composites', count: 1 },
  { key: 'redteam', label: 'Red-team Needed', count: 2, badge: 'red' },
]

const SORT_OPTIONS = ['Name A-Z', 'Name Z-A', 'Readiness High', 'Readiness Low', 'Evidence High', 'Active Clients']
const CATEGORY_OPTIONS: Category[] = ['Security', 'Coordination', 'Governance', 'Privacy', 'Medical', 'Travel', 'Property']

const KPIS = [
  { label: 'TOTAL PLAYBOOKS', value: '12', sub: '10 templates + 2 custom' },
  { label: 'ACTIVE DEPLOYMENTS', value: '5', sub: 'across 4 clients' },
  { label: 'REVENUE GENERATED', value: '$75K/mo', sub: 'from active playbooks' },
  { label: 'MOST USED', value: 'Private Ops Office', sub: '3 active deployments', gold: true },
  { label: 'AVG ACTIVATION', value: '42 min', sub: 'template to live offer' },
]

const READINESS_CHECKLIST = [
  { label: 'Credentials verified', done: true },
  { label: 'Network & partnerships', done: true },
  { label: 'Delivery capacity confirmed', done: true },
  { label: 'Compliance review', done: false },
  { label: 'Evidence review completed', done: true },
]

// ─── Audit types ─────────────────────────────────────────────
type AuditSeverity = 'critical' | 'warning'
interface AuditIssue {
  category: string
  severity: AuditSeverity
  description: string
  recommendation: string
}
interface AuditResult {
  passed: boolean
  score: number
  issues: AuditIssue[]
  ranAt: string
}

// ─── Page Component ──────────────────────────────────────────
export default function PlaybooksPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('Name A-Z')
  const [tierFilter, setTierFilter] = useState<'All' | 'HNW' | 'UHNW'>('All')
  const [categoryFilter, setCategoryFilter] = useState<'All' | Category>('All')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [showReadinessModal, setShowReadinessModal] = useState(false)
  const [activatingPlaybook, setActivatingPlaybook] = useState<Playbook | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [composerSelections, setComposerSelections] = useState<Set<number>>(new Set())
  const [composerDone, setComposerDone] = useState(false)
  const [auditLoading, setAuditLoading] = useState<string | null>(null)
  const [auditResults, setAuditResults] = useState<Record<string, AuditResult>>({})

  const runRedTeamAudit = async (playbookSlug: string) => {
    setAuditLoading(playbookSlug)
    try {
      const res = await fetch(`/api/playbooks/${playbookSlug}/red-team`, { method: 'POST' })
      const data: AuditResult = await res.json()
      setAuditResults(prev => ({ ...prev, [playbookSlug]: data }))
    } catch {
      setAuditResults(prev => ({
        ...prev,
        [playbookSlug]: {
          passed: false,
          score: 0,
          issues: [
            {
              category: 'Audit service unreachable',
              severity: 'warning',
              description: 'The red-team audit service did not respond. Results below are a local fallback.',
              recommendation: 'Retry once the audit API is online.',
            },
          ],
          ranAt: new Date().toISOString(),
        },
      }))
    } finally {
      setAuditLoading(null)
    }
  }

  const toggleComposerSelection = (id: number) => {
    const next = new Set(composerSelections)
    if (next.has(id)) { next.delete(id) } else if (next.size < 3) { next.add(id) }
    setComposerSelections(next)
  }

  const filtered = useMemo(() => {
    let list = [...PLAYBOOKS]
    // Tab filter
    if (activeTab === 'templates') list = list.filter(p => !p.isCustom)
    else if (activeTab === 'active') list = list.filter(p => p.activeClients > 0)
    else if (activeTab === 'custom') list = list.filter(p => p.isCustom)
    else if (activeTab === 'composites') list = list.filter(p => p.isComposite)
    else if (activeTab === 'redteam') list = list.filter(p => p.redTeam === 'Failed' || p.redTeam === 'Not audited')
    // Tier
    if (tierFilter !== 'All') list = list.filter(p => p.tier === tierFilter)
    // Category
    if (categoryFilter !== 'All') list = list.filter(p => p.category === categoryFilter)
    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.buyer.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }
    // Sort
    switch (sort) {
      case 'Name A-Z': list.sort((a, b) => a.name.localeCompare(b.name)); break
      case 'Name Z-A': list.sort((a, b) => b.name.localeCompare(a.name)); break
      case 'Readiness High': list.sort((a, b) => b.readiness - a.readiness); break
      case 'Readiness Low': list.sort((a, b) => a.readiness - b.readiness); break
      case 'Evidence High': list.sort((a, b) => b.evidence - a.evidence); break
      case 'Active Clients': list.sort((a, b) => b.activeClients - a.activeClients); break
    }
    return list
  }, [activeTab, tierFilter, categoryFilter, search, sort])

  const handleActivate = (p: Playbook) => {
    setActivatingPlaybook(p)
    setShowReadinessModal(true)
  }

  const readinessColor = (r: number) => r >= 100 ? 'bg-emerald-500' : r >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'
  const readinessTextColor = (r: number) => r >= 100 ? 'text-emerald-400' : r >= 80 ? 'text-[#C9A84C]' : 'text-amber-400'

  const composerPlaybooks = PLAYBOOKS.filter(p => composerSelections.has(p.id))
  const composerCombinedName = composerPlaybooks.map(p => p.name).join(' + ')

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* ─── Top Bar ───────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg">CHAMBERFORGE</Link>
          <nav className="flex gap-1">
            {NAV_TABS.map(([t, h]) => (
              <Link key={t} href={h} className={`px-3 py-4 text-sm ${t === 'Playbooks' ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}>{t}</Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ─── KPI Strip ─────────────────────────────────── */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          {KPIS.map(k => (
            <div key={k.label} className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-4 py-3">
              <p className="text-[10px] text-gray-500 tracking-wider">{k.label}</p>
              <p className={`text-lg font-bold mt-1 ${k.gold ? 'text-[#C9A84C]' : 'text-white'}`}>{k.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Filter Tabs ───────────────────────────────── */}
      <div className="px-6 flex gap-1 border-b border-[#1e2a3a]">
        {FILTER_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition ${activeTab === t.key ? 'text-[#C9A84C] border-[#C9A84C]' : 'text-gray-400 border-transparent hover:text-white'}`}>
            {t.label}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${t.badge === 'red' ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-400'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ─── Toolbar ───────────────────────────────────── */}
      <div className="px-6 py-3 flex items-center gap-3 border-b border-[#1e2a3a]">
        <div className="relative flex-1 max-w-xs">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search playbooks..."
            className="w-full bg-[#111827] border border-[#1e2a3a] rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#C9A84C] focus:outline-none" />
          <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value as typeof tierFilter)}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
          <option value="All">All Tiers</option><option value="HNW">HNW</option><option value="UHNW">UHNW</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as typeof categoryFilter)}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
          <option value="All">All Categories</option>
          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-[#C9A84C] focus:outline-none">
          {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex border border-[#1e2a3a] rounded-lg overflow-hidden ml-auto">
          <button onClick={() => setViewMode('cards')} className={`px-3 py-2 text-xs ${viewMode === 'cards' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#111827] text-gray-400'}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-xs ${viewMode === 'list' ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-[#111827] text-gray-400'}`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          </button>
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────── */}
      <div className="flex px-6 py-4 gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
        {/* Left: Cards Grid */}
        <div className="flex-1">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map(p => (
                <div key={p.id}>
                  <PlaybookCard playbook={p}
                    selected={selectedPlaybook?.id === p.id}
                    onSelect={() => setSelectedPlaybook(p)}
                    onActivate={() => handleActivate(p)}
                    composerMode={showComposer}
                    composerSelected={composerSelections.has(p.id)}
                    onComposerToggle={() => toggleComposerSelection(p.id)}
                    auditLoading={auditLoading === p.slug}
                    auditResult={auditResults[p.slug]}
                    onRunAudit={() => runRedTeamAudit(p.slug)} />
                  {auditResults[p.slug] && (
                    <AuditResultCard result={auditResults[p.slug]} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => (
                <div key={p.id}>
                  <PlaybookListItem playbook={p}
                    selected={selectedPlaybook?.id === p.id}
                    onSelect={() => setSelectedPlaybook(p)}
                    onActivate={() => handleActivate(p)} />
                  {auditResults[p.slug] && (
                    <AuditResultCard result={auditResults[p.slug]} />
                  )}
                </div>
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">No playbooks match your filters</p>
              <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="w-[300px] flex-shrink-0">
          {selectedPlaybook ? (
            <DetailPanel
              playbook={selectedPlaybook}
              onActivate={() => handleActivate(selectedPlaybook)}
              auditLoading={auditLoading === selectedPlaybook.slug}
              auditResult={auditResults[selectedPlaybook.slug]}
              onRunAudit={() => runRedTeamAudit(selectedPlaybook.slug)}
            />
          ) : (
            <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#1e2a3a] flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-gray-400 text-sm">Select a playbook to see details</p>
              <p className="text-gray-600 text-xs mt-1">Click any card to view inclusions, evidence, and compatibility</p>
              <button onClick={() => { setShowComposer(true); setComposerDone(false); setComposerSelections(new Set()) }}
                className="mt-6 w-full bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-[#C9A84C] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#C9A84C]/20 transition">
                Cross-Playbook Composer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Readiness Modal ───────────────────────────── */}
      {showReadinessModal && activatingPlaybook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowReadinessModal(false)}>
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl w-[480px] p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Founder Readiness Gate</h3>
                <p className="text-xs text-gray-500 mt-1">Activating: {activatingPlaybook.name}</p>
              </div>
              <button onClick={() => setShowReadinessModal(false)} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {READINESS_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#0D1117] rounded-lg px-4 py-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                    {item.done ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-gray-300' : 'text-red-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#0D1117] rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Readiness Score</span>
                <span className="text-lg font-bold text-[#C9A84C]">80/100</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-[#C9A84C] h-2 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowReadinessModal(false)}
                className="flex-1 border border-gray-600 text-gray-300 py-2.5 rounded-lg text-sm hover:border-gray-400 transition">
                Activate anyway
              </button>
              <button onClick={() => setShowReadinessModal(false)}
                className="flex-1 bg-[#C9A84C] text-[#0D1117] font-medium py-2.5 rounded-lg text-sm hover:bg-[#C9A84C]/90 transition">
                Complete gaps first
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Composer Modal ────────────────────────────── */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => { setShowComposer(false); setComposerDone(false); setComposerSelections(new Set()) }}>
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl w-[600px] max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Cross-Playbook Composer</h3>
                <p className="text-xs text-gray-500 mt-1">Select up to 3 playbooks to compose into a bundled offer</p>
              </div>
              <button onClick={() => { setShowComposer(false); setComposerDone(false); setComposerSelections(new Set()) }} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {!composerDone ? (
              <>
                {/* Step 1: Selection */}
                <div className="space-y-2 mb-4">
                  {PLAYBOOKS.map(p => (
                    <label key={p.id} className={`flex items-center gap-3 bg-[#0D1117] rounded-lg px-4 py-3 cursor-pointer border transition ${composerSelections.has(p.id) ? 'border-[#C9A84C]' : 'border-transparent hover:border-[#1e2a3a]'}`}>
                      <input type="checkbox" checked={composerSelections.has(p.id)} onChange={() => toggleComposerSelection(p.id)}
                        disabled={!composerSelections.has(p.id) && composerSelections.size >= 3}
                        className="accent-[#C9A84C] w-4 h-4" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{p.price}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${p.tier === 'UHNW' ? 'text-[#C9A84C] border-[#C9A84C]/40' : 'text-blue-400 border-blue-700'}`}>{p.tier}</span>
                    </label>
                  ))}
                </div>
                {composerSelections.size > 0 && (
                  <div className="bg-[#0D1117] rounded-lg p-4 mb-4 border border-[#1e2a3a]">
                    <p className="text-xs text-gray-500 mb-1">Combined Playbook</p>
                    <p className="text-sm font-semibold text-[#C9A84C]">{composerCombinedName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Merged range: {composerPlaybooks.map(p => p.price).join(' + ')}
                    </p>
                  </div>
                )}
                <button onClick={() => setComposerDone(true)} disabled={composerSelections.size < 2}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${composerSelections.size >= 2 ? 'bg-[#C9A84C] text-[#0D1117] hover:bg-[#C9A84C]/90' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                  Compose ({composerSelections.size}/3 selected)
                </button>
              </>
            ) : (
              <>
                {/* Step 2: Composed Preview */}
                <div className="bg-[#0D1117] rounded-lg p-4 mb-4 border border-[#C9A84C]/30">
                  <p className="text-xs text-[#C9A84C] font-medium mb-2">COMPOSED PLAYBOOK</p>
                  <p className="text-base font-semibold">{composerCombinedName}</p>
                  <p className="text-xs text-gray-400 mt-1">Combined price range: {composerPlaybooks.map(p => p.price).join(' + ')}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">COMBINED VALUE STACK</p>
                  <div className="space-y-1">
                    {composerPlaybooks.flatMap(p => p.included.filter(i => i.done).slice(0, 3).map(i => (
                      <div key={`${p.id}-${i.label}`} className="flex items-center gap-2 text-xs text-gray-300">
                        <span className="text-emerald-400">&#10003;</span>
                        <span>{i.label}</span>
                        <span className="text-gray-600 ml-auto">{p.name}</span>
                      </div>
                    )))}
                  </div>
                </div>
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-400 font-medium mb-1">Conflict Warnings</p>
                  <p className="text-xs text-amber-300/80">Overlapping vendor management scope detected across selected playbooks. Review delivery model compatibility before finalizing.</p>
                  {composerPlaybooks.some(p => p.redTeam === 'Failed') && (
                    <p className="text-xs text-red-400 mt-1">One or more selected playbooks have failed red-team review.</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setComposerDone(false)} className="flex-1 border border-gray-600 text-gray-300 py-2.5 rounded-lg text-sm hover:border-gray-400">Back</button>
                  <button onClick={() => { setShowComposer(false); setComposerDone(false); setComposerSelections(new Set()) }}
                    className="flex-1 bg-[#C9A84C] text-[#0D1117] font-medium py-2.5 rounded-lg text-sm hover:bg-[#C9A84C]/90">
                    Create Composite Offer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Playbook Card Component ─────────────────────────────────
function PlaybookCard({ playbook: p, selected, onSelect, onActivate, composerMode, composerSelected, onComposerToggle, auditLoading, auditResult, onRunAudit }: {
  playbook: Playbook; selected: boolean; onSelect: () => void; onActivate: () => void
  composerMode: boolean; composerSelected: boolean; onComposerToggle: () => void
  auditLoading: boolean; auditResult?: AuditResult; onRunAudit: () => void
}) {
  const redTeamBg = p.redTeam === 'Passed' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700' : p.redTeam === 'Failed' ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-gray-800 text-gray-400 border-gray-700'
  const readinessColor = p.readiness >= 100 ? 'bg-emerald-500' : p.readiness >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'
  const readinessText = p.readiness >= 100 ? 'text-emerald-400' : p.readiness >= 80 ? 'text-[#C9A84C]' : 'text-amber-400'

  return (
    <div onClick={onSelect}
      className={`bg-[#111827] rounded-lg border overflow-hidden cursor-pointer transition group ${selected ? 'border-[#C9A84C]' : 'border-[#1e2a3a] hover:border-[#1e2a3a]/80'}`}>
      {/* Accent bar */}
      <div className={`h-[3px] ${CATEGORY_COLORS[p.category]}`} />
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {composerMode && (
              <input type="checkbox" checked={composerSelected} onChange={e => { e.stopPropagation(); onComposerToggle() }}
                onClick={e => e.stopPropagation()} className="accent-[#C9A84C] w-4 h-4" />
            )}
            <h3 className="text-sm font-semibold group-hover:text-[#C9A84C] transition">{p.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-[#C9A84C]">{p.price}</span>
            <p className="text-[10px] text-gray-500">{p.pricingModel}</p>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${p.tier === 'UHNW' ? 'text-[#C9A84C] border-[#C9A84C]/40 bg-[#C9A84C]/10' : 'text-blue-400 border-blue-700 bg-blue-900/30'}`}>{p.tier}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${LIFECYCLE_COLORS[p.lifecycle]}`}>{p.lifecycle}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-400">{p.deliveryModel}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${redTeamBg}`}>{p.redTeam === 'Not audited' ? 'Not audited' : `Red-team: ${p.redTeam}`}</span>
          {p.activeClients > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/40 font-medium">{p.activeClients} active</span>
          )}
        </div>

        {/* Target + Pain */}
        <p className="text-[11px] text-gray-400 mb-1"><span className="text-gray-500">Target:</span> {p.buyer}</p>
        <p className="text-[11px] text-gray-400 mb-3"><span className="text-gray-500">Pain:</span> {p.pain}</p>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 bg-[#0D1117] rounded-lg p-2.5 mb-3">
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Evidence</p>
            <p className="text-xs font-semibold text-white">{p.evidence}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">WTP</p>
            <p className="text-xs font-semibold text-white">{p.wtp}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">Activation</p>
            <p className="text-xs font-semibold text-white">{p.activationTime}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">KPIs</p>
            <p className="text-xs font-semibold text-white">{p.kpisDefined}</p>
          </div>
        </div>

        {/* Readiness bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-500">Readiness</span>
            <span className={`text-[10px] font-medium ${readinessText}`}>{p.readiness}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div className={`${readinessColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(p.readiness, 100)}%` }} />
          </div>
        </div>

        {/* Integration badges */}
        <div className="flex gap-1.5 mb-3">
          <IntBadge label="VoiceForge" active={p.integrations.vf} color="purple" />
          <IntBadge label="VisionAudio" active={p.integrations.va} color="teal" />
          <IntBadge label="Deal Desk" active={p.integrations.dd} color="blue" />
          <IntBadge label="Trust Pack" active={p.integrations.tp} color="amber" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {p.redTeam === 'Failed' ? (
            <button onClick={e => { e.stopPropagation(); window.location.href = `/playbooks/${p.slug}/red-team?mode=fix` }} className="text-[11px] bg-red-900/50 text-red-400 border border-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-900/70 transition">Fix issues</button>
          ) : (
            <button onClick={e => { e.stopPropagation(); onActivate() }} className="text-[11px] bg-[#C9A84C] text-[#0D1117] font-medium px-3 py-1.5 rounded hover:bg-[#C9A84C]/90 transition">Activate</button>
          )}
          <button onClick={e => { e.stopPropagation(); onSelect() }} className="text-[11px] border border-gray-600 text-gray-300 px-3 py-1.5 rounded hover:border-gray-400 transition">View details</button>
          <button onClick={e => { e.stopPropagation(); window.location.href = `/playbooks/${p.slug}/customize` }} className="text-[11px] border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1.5 rounded hover:bg-[#C9A84C]/10 transition">Customize</button>
          <button
            disabled={auditLoading}
            onClick={e => { e.stopPropagation(); onRunAudit() }}
            className="text-[11px] border border-purple-700 text-purple-400 px-3 py-1.5 rounded hover:bg-purple-900/30 transition disabled:opacity-60 flex items-center gap-1.5"
          >
            {auditLoading ? (
              <><Spinner /> Running audit…</>
            ) : auditResult ? (
              'Re-run audit'
            ) : (
              'Red-team'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Small spinner ───────────────────────────────────────────
function Spinner() {
  return (
    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Audit result card (appears beneath playbook card) ───────
function AuditResultCard({ result }: { result: AuditResult }) {
  return (
    <div className={`mt-3 rounded-lg p-4 border ${result.passed ? 'bg-[#0F2E1A] border-[#1D9E75]/30' : 'bg-[#1f0d0d] border-[#E24B4A]/30'}`}>
      <div className={`text-[11px] font-semibold mb-3 ${result.passed ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
        Red-team audit: {result.passed ? 'Passed' : 'Failed'} · Score: {result.score}/100
      </div>
      {result.issues.map((issue, i) => (
        <div key={i} className="flex gap-2 mb-2 last:mb-0">
          <span className={issue.severity === 'critical' ? 'text-[#E24B4A]' : 'text-[#BA7517]'}>
            {issue.severity === 'critical' ? '✗' : '!'}
          </span>
          <div>
            <div className="text-[11px] font-medium text-[#e2e8f0]">{issue.category}</div>
            <div className="text-[10px] text-[#8892a4] leading-relaxed">{issue.description}</div>
            <div className="text-[10px] text-[#C9A84C] mt-0.5">Fix: {issue.recommendation}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── List Item Component ─────────────────────────────────────
function PlaybookListItem({ playbook: p, selected, onSelect, onActivate }: {
  playbook: Playbook; selected: boolean; onSelect: () => void; onActivate: () => void
}) {
  const redTeamBg = p.redTeam === 'Passed' ? 'text-emerald-400' : p.redTeam === 'Failed' ? 'text-red-400' : 'text-gray-400'
  const readinessColor = p.readiness >= 100 ? 'bg-emerald-500' : p.readiness >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'

  return (
    <div onClick={onSelect}
      className={`bg-[#111827] rounded-lg border overflow-hidden cursor-pointer transition flex items-center gap-4 px-4 py-3 ${selected ? 'border-[#C9A84C]' : 'border-[#1e2a3a] hover:border-[#1e2a3a]/80'}`}>
      <div className={`w-1 h-10 rounded-full ${CATEGORY_COLORS[p.category]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{p.name}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${p.tier === 'UHNW' ? 'text-[#C9A84C] border-[#C9A84C]/40' : 'text-blue-400 border-blue-700'}`}>{p.tier}</span>
          <span className={`text-[10px] ${redTeamBg}`}>{p.redTeam}</span>
        </div>
        <p className="text-[10px] text-gray-500 truncate">{p.buyer} — {p.pain}</p>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
        <span>{p.evidence} ev</span>
        <span>{p.wtp} wtp</span>
        <span>{p.activationTime}</span>
        <div className="w-16">
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div className={`${readinessColor} h-1.5 rounded-full`} style={{ width: `${Math.min(p.readiness, 100)}%` }} />
          </div>
        </div>
        <span className="text-[#C9A84C] font-semibold">{p.price}</span>
        {p.activeClients > 0 && <span className="text-[#C9A84C] text-[10px]">{p.activeClients} active</span>}
        {p.redTeam === 'Failed' ? (
          <button onClick={e => { e.stopPropagation() }} className="text-[10px] bg-red-900/50 text-red-400 border border-red-700 px-2 py-1 rounded">Fix</button>
        ) : (
          <button onClick={e => { e.stopPropagation(); onActivate() }} className="text-[10px] bg-[#C9A84C] text-[#0D1117] font-medium px-2 py-1 rounded">Activate</button>
        )}
      </div>
    </div>
  )
}

// ─── Integration Badge ───────────────────────────────────────
function IntBadge({ label, active, color }: { label: string; active: boolean; color: string }) {
  const activeClasses: Record<string, string> = {
    purple: 'bg-purple-900/40 text-purple-400 border-purple-700',
    teal: 'bg-teal-900/40 text-teal-400 border-teal-700',
    blue: 'bg-blue-900/40 text-blue-400 border-blue-700',
    amber: 'bg-amber-900/40 text-amber-400 border-amber-700',
  }
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${active ? activeClasses[color] : 'bg-gray-800/50 text-gray-600 border-gray-800'}`}>
      {label}
    </span>
  )
}

// ─── Detail Panel ────────────────────────────────────────────
function DetailPanel({ playbook: p, onActivate, auditLoading, auditResult, onRunAudit }: { playbook: Playbook; onActivate: () => void; auditLoading: boolean; auditResult?: AuditResult; onRunAudit: () => void }) {
  const readinessColor = p.readiness >= 100 ? 'bg-emerald-500' : p.readiness >= 80 ? 'bg-[#C9A84C]' : 'bg-amber-500'
  const readinessText = p.readiness >= 100 ? 'text-emerald-400' : p.readiness >= 80 ? 'text-[#C9A84C]' : 'text-amber-400'

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`h-[3px] ${CATEGORY_COLORS[p.category]}`} />
      <div className="p-4">
        <h3 className="text-base font-semibold mb-1">{p.name}</h3>
        <p className="text-sm text-[#C9A84C] font-medium mb-3">{p.price}</p>
        <div className="flex items-center gap-1 mb-4">
          <span className="text-[10px] text-gray-500">Readiness:</span>
          <span className={`text-[10px] font-medium ${readinessText}`}>{p.readiness}%</span>
          <div className="flex-1 bg-gray-800 rounded-full h-1 ml-1">
            <div className={`${readinessColor} h-1 rounded-full`} style={{ width: `${Math.min(p.readiness, 100)}%` }} />
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-2">WHAT&apos;S INCLUDED</p>
          <div className="space-y-1.5">
            {p.included.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                {item.done ? (
                  <span className="text-emerald-400 flex-shrink-0">&#10003;</span>
                ) : (
                  <span className="text-gray-600 flex-shrink-0">&#10007;</span>
                )}
                <span className={item.done ? 'text-gray-300' : 'text-gray-600'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Citations */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-2">TOP EVIDENCE</p>
          <div className="space-y-2">
            {p.citations.map((c, i) => (
              <div key={i} className="bg-[#0D1117] rounded p-2">
                <p className="text-[10px] text-gray-300 mb-1">{c.source}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-1">
                    <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${c.credibility}%` }} />
                  </div>
                  <span className="text-[9px] text-emerald-400">{c.credibility}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compatible Playbooks */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 font-medium tracking-wider mb-2">COMPATIBLE FOR COMPOSITION</p>
          <div className="flex flex-wrap gap-1">
            {p.compatible.map(name => (
              <span key={name} className="text-[10px] px-2 py-1 rounded bg-[#0D1117] border border-[#1e2a3a] text-gray-400">{name}</span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {p.redTeam === 'Failed' ? (
            <button onClick={() => window.location.href = `/playbooks/${p.slug}/red-team?mode=fix`} className="w-full text-xs bg-red-900/50 text-red-400 border border-red-700 font-medium py-2 rounded-lg hover:bg-red-900/70 transition">Fix Red-team Issues</button>
          ) : (
            <button onClick={onActivate} className="w-full text-xs bg-[#C9A84C] text-[#0D1117] font-medium py-2 rounded-lg hover:bg-[#C9A84C]/90 transition">Activate Playbook</button>
          )}
          <button onClick={() => window.location.href = `/playbooks/${p.slug}/customize`} className="w-full text-xs border border-[#C9A84C]/40 text-[#C9A84C] py-2 rounded-lg hover:bg-[#C9A84C]/10 transition">Customize</button>
          <button
            onClick={onRunAudit}
            disabled={auditLoading}
            className="w-full text-xs border border-purple-700 text-purple-400 py-2 rounded-lg hover:bg-purple-900/30 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {auditLoading ? (
              <><Spinner /> Running audit…</>
            ) : auditResult ? (
              'Re-run Red-team Audit'
            ) : (
              'Run Red-team Audit'
            )}
          </button>
          {auditResult && (
            <div className={`mt-2 rounded-lg p-3 border text-[11px] ${auditResult.passed ? 'bg-[#0F2E1A] border-[#1D9E75]/30 text-[#1D9E75]' : 'bg-[#1f0d0d] border-[#E24B4A]/30 text-[#E24B4A]'}`}>
              {auditResult.passed ? 'Passed' : 'Failed'} · Score {auditResult.score}/100 · {auditResult.issues.length} issues
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
