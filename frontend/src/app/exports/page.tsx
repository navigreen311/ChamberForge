'use client'

import { useState, useMemo } from 'react'

// ─── Types ───────────────────────────────────────────────────
type ExportType =
  | 'offer_pdf'
  | 'client_proposal'
  | 'quarterly_scorecard'
  | 'discovery_report'
  | 'pre_meeting_brief'
  | 'playbook_one_pager'
  | 'platform_report'

type FormatOption = 'PDF' | 'DOCX' | 'XLSX'

interface ExportTypeCard {
  type: ExportType
  icon: string
  name: string
  description: string
}

interface ExportRecord {
  id: string
  filename: string
  type: ExportType
  date: string
  generatedBy: string
  downloadUrl: string
  shareUrl: string
}

interface EntityOption {
  id: string
  label: string
  category: 'offer' | 'client' | 'playbook'
}

// ─── Inline Data ─────────────────────────────────────────────
const EXPORT_TYPES: ExportTypeCard[] = [
  { type: 'offer_pdf', icon: '📄', name: 'Offer PDF', description: 'Full offer package with pricing, terms, and scope of service for client review.' },
  { type: 'client_proposal', icon: '📋', name: 'Client Proposal', description: 'Branded proposal document tailored to prospect discovery and objectives.' },
  { type: 'quarterly_scorecard', icon: '📊', name: 'Quarterly Scorecard', description: 'KPI performance summary with trend analysis and health indicators.' },
  { type: 'discovery_report', icon: '🔍', name: 'Discovery Report', description: 'Comprehensive findings from client discovery sessions and gap analysis.' },
  { type: 'pre_meeting_brief', icon: '📝', name: 'Pre-Meeting Brief', description: 'One-page situational brief with key talking points and objectives.' },
  { type: 'playbook_one_pager', icon: '📘', name: 'Playbook One-Pager', description: 'Condensed playbook summary for quick reference during engagements.' },
  { type: 'platform_report', icon: '📈', name: 'Platform Report', description: 'Full platform analytics export with usage metrics and ROI data.' },
]

const ENTITIES: EntityOption[] = [
  { id: 'o1', label: 'Private Ops Office — Chen', category: 'offer' },
  { id: 'o2', label: 'Family Cyber Command — Wellington', category: 'offer' },
  { id: 'o3', label: 'Ecosystem Orchestrator — Harrington', category: 'offer' },
  { id: 'o4', label: 'Concierge Shield — Nakamura', category: 'offer' },
  { id: 'c1', label: 'Sarah Chen', category: 'client' },
  { id: 'c2', label: 'Wellington Trust', category: 'client' },
  { id: 'c3', label: 'Harrington Dynasty', category: 'client' },
  { id: 'c4', label: 'Nakamura Holdings', category: 'client' },
  { id: 'p1', label: 'HNW Onboarding Playbook', category: 'playbook' },
  { id: 'p2', label: 'UHNW Retention Playbook', category: 'playbook' },
  { id: 'p3', label: 'Risk Assessment Playbook', category: 'playbook' },
]

const EXPORT_HISTORY: ExportRecord[] = [
  { id: 'e1', filename: 'Chen_PrivateOps_Offer_v3.pdf', type: 'offer_pdf', date: '2026-04-02', generatedBy: 'You', downloadUrl: '#', shareUrl: '#' },
  { id: 'e2', filename: 'Wellington_Proposal_Q2.pdf', type: 'client_proposal', date: '2026-04-01', generatedBy: 'You', downloadUrl: '#', shareUrl: '#' },
  { id: 'e3', filename: 'Q1_2026_Scorecard.pdf', type: 'quarterly_scorecard', date: '2026-03-31', generatedBy: 'Maria K.', downloadUrl: '#', shareUrl: '#' },
  { id: 'e4', filename: 'Harrington_Discovery_Final.pdf', type: 'discovery_report', date: '2026-03-28', generatedBy: 'You', downloadUrl: '#', shareUrl: '#' },
  { id: 'e5', filename: 'Nakamura_PreMeeting_Apr3.pdf', type: 'pre_meeting_brief', date: '2026-03-27', generatedBy: 'David R.', downloadUrl: '#', shareUrl: '#' },
  { id: 'e6', filename: 'HNW_Onboarding_OnePager.pdf', type: 'playbook_one_pager', date: '2026-03-25', generatedBy: 'You', downloadUrl: '#', shareUrl: '#' },
  { id: 'e7', filename: 'Platform_Analytics_Mar2026.xlsx', type: 'platform_report', date: '2026-03-24', generatedBy: 'System', downloadUrl: '#', shareUrl: '#' },
  { id: 'e8', filename: 'Chen_Proposal_Renewal.pdf', type: 'client_proposal', date: '2026-03-22', generatedBy: 'You', downloadUrl: '#', shareUrl: '#' },
]

const TYPE_LABELS: Record<ExportType, string> = {
  offer_pdf: 'Offer PDF',
  client_proposal: 'Client Proposal',
  quarterly_scorecard: 'Quarterly Scorecard',
  discovery_report: 'Discovery Report',
  pre_meeting_brief: 'Pre-Meeting Brief',
  playbook_one_pager: 'Playbook One-Pager',
  platform_report: 'Platform Report',
}

const BADGE_COLORS: Record<ExportType, string> = {
  offer_pdf: 'bg-amber-500/20 text-amber-400',
  client_proposal: 'bg-blue-500/20 text-blue-400',
  quarterly_scorecard: 'bg-emerald-500/20 text-emerald-400',
  discovery_report: 'bg-purple-500/20 text-purple-400',
  pre_meeting_brief: 'bg-cyan-500/20 text-cyan-400',
  playbook_one_pager: 'bg-rose-500/20 text-rose-400',
  platform_report: 'bg-indigo-500/20 text-indigo-400',
}

// ─── Component ───────────────────────────────────────────────
export default function ExportsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ExportType | ''>('')
  const [modalEntity, setModalEntity] = useState('')
  const [modalFormat, setModalFormat] = useState<FormatOption>('PDF')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadReady, setDownloadReady] = useState(false)
  const [filterType, setFilterType] = useState<ExportType | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filteredHistory = useMemo(
    () => filterType === 'all' ? EXPORT_HISTORY : EXPORT_HISTORY.filter(e => e.type === filterType),
    [filterType],
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filteredHistory.length) setSelected(new Set())
    else setSelected(new Set(filteredHistory.map(e => e.id)))
  }

  const openModal = (type?: ExportType) => {
    setModalType(type ?? '')
    setModalEntity('')
    setModalFormat('PDF')
    setGenerating(false)
    setProgress(0)
    setDownloadReady(false)
    setModalOpen(true)
  }

  const startGenerate = () => {
    setGenerating(true)
    setProgress(0)
    setDownloadReady(false)
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18 + 5
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => setDownloadReady(true), 400) }
      setProgress(Math.round(p))
    }, 300)
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Export Suite</h1>
          <p className="text-zinc-400 mt-1">Generate, manage, and share branded exports across your practice.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg transition-colors"
        >
          Generate New Export
        </button>
      </div>

      {/* Export Types Grid */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Export Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPORT_TYPES.map(et => (
            <div key={et.type} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{et.icon}</span>
                <h3 className="font-semibold text-zinc-100">{et.name}</h3>
              </div>
              <p className="text-sm text-zinc-400 flex-1">{et.description}</p>
              <button
                onClick={() => openModal(et.type)}
                className="self-start px-4 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-lg transition-colors"
              >
                Generate
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Export History */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-300">Recent Exports</h2>
          <div className="flex items-center gap-3">
            {selected.size > 0 && (
              <button className="px-4 py-1.5 text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors">
                Export as ZIP ({selected.size})
              </button>
            )}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as ExportType | 'all')}
              className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              {EXPORT_TYPES.map(et => (
                <option key={et.type} value={et.type}>{et.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th className="text-left p-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filteredHistory.length && filteredHistory.length > 0}
                    onChange={toggleAll}
                    className="accent-amber-500 rounded"
                  />
                </th>
                <th className="text-left p-3">Filename</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Generated By</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(rec => (
                <tr key={rec.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(rec.id)}
                      onChange={() => toggleSelect(rec.id)}
                      className="accent-amber-500 rounded"
                    />
                  </td>
                  <td className="p-3 font-medium text-zinc-200">{rec.filename}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_COLORS[rec.type]}`}>
                      {TYPE_LABELS[rec.type]}
                    </span>
                  </td>
                  <td className="p-3 text-zinc-400">{rec.date}</td>
                  <td className="p-3 text-zinc-400">{rec.generatedBy}</td>
                  <td className="p-3 flex gap-2">
                    <a href={rec.downloadUrl} className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors">Download</a>
                    <a href={rec.shareUrl} className="text-zinc-400 hover:text-zinc-300 text-xs font-medium transition-colors">Share</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Watermark Notice */}
      <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-zinc-400">
        <span className="text-lg">🔒</span>
        <span>All exports include an invisible watermark tied to your account for security and compliance tracking.</span>
      </div>

      {/* ─── Generate Modal ──────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Generate Export</h2>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 text-xl leading-none">&times;</button>
            </div>

            {!downloadReady ? (
              <div className="space-y-5">
                {/* Select Type */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Export Type</label>
                  <select
                    value={modalType}
                    onChange={e => setModalType(e.target.value as ExportType)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select a type...</option>
                    {EXPORT_TYPES.map(et => (
                      <option key={et.type} value={et.type}>{et.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Entity */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Select Entity</label>
                  <select
                    value={modalEntity}
                    onChange={e => setModalEntity(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select an entity...</option>
                    <optgroup label="Offers">
                      {ENTITIES.filter(e => e.category === 'offer').map(e => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Clients">
                      {ENTITIES.filter(e => e.category === 'client').map(e => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Playbooks">
                      {ENTITIES.filter(e => e.category === 'playbook').map(e => (
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Format Options */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Format</label>
                  <div className="flex gap-2">
                    {(['PDF', 'DOCX', 'XLSX'] as FormatOption[]).map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setModalFormat(fmt)}
                        className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
                          modalFormat === fmt
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                {generating && (
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Generating...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={startGenerate}
                  disabled={!modalType || !modalEntity || generating}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-semibold rounded-lg transition-colors"
                >
                  {generating ? 'Generating...' : `Generate ${modalFormat}`}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="text-4xl">✅</div>
                <p className="text-zinc-200 font-medium">Export generated successfully!</p>
                <p className="text-sm text-zinc-400">
                  {ENTITIES.find(e => e.id === modalEntity)?.label ?? 'Export'} &mdash; {TYPE_LABELS[modalType as ExportType]}
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <a
                    href="#"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg transition-colors"
                  >
                    Download {modalFormat}
                  </a>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
