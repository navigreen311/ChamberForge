'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopBar from '../../../components/shared/TopBar'
import CommandAIButton from '../../../components/shared/CommandAIButton'

type DealStageId = 'awareness' | 'interest' | 'evaluation' | 'decision' | 'closed'

interface ClientSummary {
  id: string
  name: string
  company: string
  tier: 'HNW' | 'UHNW'
  health: number | null
  lastContact: string
  lastContactDays: number
  painFocus: string[]
  activeOffers: number
  wealthEvents: { label: string; amount?: string; when: string }[]
  intel: string[]
  touchpoints: { type: string; desc: string; time: string }[]
  matchedProblem: { id: string; name: string; lifecycle: string; credibility: number }
  matchedOffer: { name: string; priceMonthly: number; rationale: string }
  objections: { risk: string; response: string }[]
  dealStage: DealStageId
  daysInStage: number
  lastContactScore: number
  lastContactNote: string
  kpiScore: number
  kpiNote: string
  engagementScore: number
  engagementNote: string
  wealthAlignScore: number
  wealthNote: string
  offerProgressScore: number
  offerNote: string
  competitors: {
    name: string
    type: string
    daysSincePitch: number
    threat: 'high' | 'medium' | 'low'
    offering: string
    weakness: string
    counterPosition: string
  }[]
}

const DEAL_STAGES: { id: DealStageId; label: string; desc: string }[] = [
  { id: 'awareness', label: 'Awareness', desc: 'Client knows you exist' },
  { id: 'interest', label: 'Interest', desc: 'Expressed willingness to learn more' },
  { id: 'evaluation', label: 'Evaluating', desc: 'Comparing options actively' },
  { id: 'decision', label: 'Decision', desc: 'Ready to commit or decline' },
  { id: 'closed', label: 'Closed', desc: 'Retainer signed' },
]

const FALLBACK: ClientSummary = {
  id: 'unknown',
  name: 'Alexandra Rothwell',
  company: 'Rothwell Family Office',
  tier: 'UHNW',
  health: 84,
  lastContact: '3 days ago',
  lastContactDays: 3,
  painFocus: ['Security', 'Governance'],
  activeOffers: 1,
  wealthEvents: [
    { label: 'Secondary liquidity event', amount: '$180M', when: '22 days ago' },
    { label: 'Board exit from public company', when: '51 days ago' },
  ],
  intel: [
    'Recent $180M secondary — new capital looking for structured stewardship.',
    'Son joins family office in Q3 — next-gen governance conversations are live.',
    'Competing advisor (Morgan Stanley PWM) pitched last week; relationship strained.',
    'Mentioned cybersecurity unease after peer-family fraud event in industry press.',
    'Lifestyle staff turnover (chief of staff resigned) — coordination gap widening.',
  ],
  touchpoints: [
    { type: 'call', desc: 'Quarterly review — governance topic raised', time: '3d ago' },
    { type: 'email', desc: 'Forwarded WSJ piece on AI voice-clone fraud', time: '9d ago' },
    { type: 'meeting', desc: 'Dinner with son, informal intro to office', time: '21d ago' },
    { type: 'doc', desc: 'Shared Trust Pack v2 for review', time: '38d ago' },
    { type: 'call', desc: 'Kickoff on cyber audit scope', time: '49d ago' },
  ],
  matchedProblem: {
    id: 'prob-014',
    name: 'UHNW household cyber & impersonation risk',
    lifecycle: 'Accelerating',
    credibility: 9.2,
  },
  matchedOffer: {
    name: 'Family Cyber Command — retainer',
    priceMonthly: 28000,
    rationale:
      'Alexandra explicitly flagged the peer fraud event. Tier + liquidity profile aligns with the full retainer scope. Governance add-on warms up the next-gen conversation.',
  },
  objections: [
    {
      risk: '"We already have a CISO at the operating company."',
      response:
        'Operating-company CISOs protect the business. This retainer protects the household — a different threat surface, different protocols, and a different accountability chain.',
    },
    {
      risk: '"My bank already runs fraud monitoring."',
      response:
        'Bank monitoring catches transactions after they clear a threshold. Our wire-verification protocol prevents the transfer from being initiated — it sits upstream of the bank.',
    },
    {
      risk: '"Is this really worth $28K/month?"',
      response:
        'Median single-incident loss among UHNW households is $2.4M (FinCEN, 2025). One prevented incident pays for 7 years of retainer. This is insurance you can actively operate.',
    },
  ],
  dealStage: 'evaluation',
  daysInStage: 9,
  lastContactScore: 17,
  lastContactNote: 'Last touchpoint 3d ago — within the 7d ideal window for active evaluation.',
  kpiScore: 15,
  kpiNote: 'Existing cyber audit retainer hitting 4 of 4 KPIs, but the governance KPI has been unreported for 45 days.',
  engagementScore: 18,
  engagementNote: 'Trust Pack v2 opened 3 times. Forwarded WSJ piece unprompted — strongest engagement signal in 90 days.',
  wealthAlignScore: 19,
  wealthNote: '$180M secondary + board exit = peak capital deployment window. Tier + liquidity profile aligns perfectly with retainer scope.',
  offerProgressScore: 15,
  offerNote: 'One active retainer, one proposal in review. Ecosystem suggests upsell is live; no contract friction yet.',
  competitors: [
    {
      name: 'Morgan Stanley PWM',
      type: 'Large institutional advisor',
      daysSincePitch: 7,
      threat: 'high',
      offering: 'Full wealth management + family office services, AUM-based fee',
      weakness:
        'Generalist approach — same RM handles 40+ client relationships, no household-specific security or coordination expertise.',
      counterPosition:
        'Morgan Stanley manages the money. You manage the household. Different job, different expertise, different team. Position as a complement, not a competitor — then show the cyber incident data.',
    },
    {
      name: 'Private Family Office Consortium',
      type: 'Boutique peer network referral',
      daysSincePitch: 21,
      threat: 'medium',
      offering: 'Shared chief-of-staff pool across 6 family offices, event-driven engagement model',
      weakness:
        'Shared staff means divided loyalty and no dedicated household protocol. Quality of the assigned operator varies widely week to week.',
      counterPosition:
        'Named operator, dedicated retainer, documented SLA. Ask: "When the wire-verification call comes at 9pm, who picks up — and are they yours?"',
    },
    {
      name: 'Status quo (do nothing)',
      type: 'Internal inertia',
      daysSincePitch: 0,
      threat: 'low',
      offering: 'Keep current patchwork — CISO at op-co, bank fraud monitoring, informal staff screening.',
      weakness:
        'The patchwork is exactly what FinCEN identified as the failure mode — no single accountable owner for household surface, median $2.4M loss when it breaks.',
      counterPosition:
        'Frame inaction as a choice, not a default. "The decision is not whether to spend the money — it is whether the household has a named owner for this surface."',
    },
  ],
}

interface BriefData {
  summary: string
  painSignals: string[]
  opener: string
  objections: { risk: string; response: string }[]
  proofPoint: string
}

export default function DecisionRoomPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params?.id ?? '')
  const clientId = id

  const [client, setClient] = useState<ClientSummary | null>(null)
  const [pitchOpener, setPitchOpener] = useState('')
  const [pitchLoading, setPitchLoading] = useState(false)
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [decisionLogged, setDecisionLogged] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Schedule Meeting modal
  const [showSchedule, setShowSchedule] = useState(false)
  const [meetingType, setMeetingType] = useState('Discovery follow-up')
  const [meetingDateTime, setMeetingDateTime] = useState('')
  const [meetingAgenda, setMeetingAgenda] = useState('')
  const [savingMeeting, setSavingMeeting] = useState(false)

  // Log Decision modal
  const [showLog, setShowLog] = useState(false)
  const [logOutcome, setLogOutcome] = useState<string | null>(null)
  const [logNotes, setLogNotes] = useState('')
  const [logFollowUp, setLogFollowUp] = useState('')
  const [savingLog, setSavingLog] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const updateDealStage = async (stageId: DealStageId) => {
    if (!client) return
    setClient({ ...client, dealStage: stageId, daysInStage: 0 })
    try {
      await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealStage: stageId, stageUpdatedAt: new Date().toISOString() }),
      })
    } catch {
      /* soft-fail */
    }
    showToast(`Deal stage advanced to ${DEAL_STAGES.find(s => s.id === stageId)?.label ?? stageId}`)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/clients/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('not ok')
        const data = await res.json()
        if (cancelled) return
        setClient({ ...FALLBACK, ...data, id })
      } catch {
        if (!cancelled) setClient({ ...FALLBACK, id })
      }
    }
    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  const generatePitchOpener = async () => {
    if (!client) return
    setPitchLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/generate-pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          company: client.company,
          tier: client.tier,
          wealthEvents: client.wealthEvents,
          painCategory: client.painFocus[0],
          offerName: client.matchedOffer.name,
          competitorContext: client.intel.filter(x => /morgan stanley|competing|competitor/i.test(x)),
        }),
      })
      if (!res.ok) throw new Error('not ok')
      const data = await res.json()
      setPitchOpener(
        data.pitchOpener ??
          `Alexandra — I saw the WSJ piece on the peer fraud incident, and it struck me because we've just finished a household cyber review for two other single-family offices in your tier. Given the $180M that landed in the office last month, this is the exact window where the protocol gap becomes most expensive. Would Thursday work for a 20-minute walk-through of what a readiness audit would look like?`,
      )
    } catch {
      setPitchOpener(
        `Alexandra — I saw the WSJ piece on the peer fraud incident, and it struck me because we've just finished a household cyber review for two other single-family offices in your tier. Given the $180M that landed in the office last month, this is the exact window where the protocol gap becomes most expensive. Would Thursday work for a 20-minute walk-through of what a readiness audit would look like?`,
      )
    } finally {
      setPitchLoading(false)
    }
  }

  const generateBrief = async () => {
    if (!client) return
    setBriefLoading(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/generate-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quick', context: 'decision_room' }),
      })
      if (!res.ok) throw new Error('not ok')
      const data = await res.json()
      setBrief(
        (data.brief as BriefData) ??
          buildFallbackBrief(client, pitchOpener),
      )
    } catch {
      setBrief(buildFallbackBrief(client, pitchOpener))
    } finally {
      setBriefLoading(false)
    }
  }

  const saveMeeting = async () => {
    if (!client) return
    setSavingMeeting(true)
    try {
      await fetch(`/api/deliver/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          name: `Meeting: ${client.name}`,
          type: 'meeting',
          meetingType,
          dueAt: meetingDateTime || null,
          notes: meetingAgenda,
        }),
      })
    } catch {
      /* soft-fail */
    }
    setSavingMeeting(false)
    setShowSchedule(false)
    setMeetingAgenda('')
    setMeetingDateTime('')
    setMeetingType('Discovery follow-up')
    showToast('Meeting scheduled and added to task list')
  }

  const saveDecisionLog = async () => {
    if (!client) return
    setSavingLog(true)
    try {
      await fetch(`/api/clients/${clientId}/touchpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'decision_room',
          outcome: logOutcome,
          notes: logNotes,
          followUpDate: logFollowUp || null,
        }),
      })
    } catch {
      /* soft-fail */
    }
    setSavingLog(false)
    setDecisionLogged(true)
    setShowLog(false)
    setLogOutcome(null)
    setLogNotes('')
    setLogFollowUp('')
    showToast('Decision logged to client history')
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white">
        <TopBar activePage="Clients" />
        <div className="px-6 py-20 text-center text-gray-500">Loading decision room…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <TopBar activePage="Clients" />
      <CommandAIButton />

      <div className="px-6 py-4">
        <button
          onClick={() => router.push('/clients')}
          className="text-[11px] text-gray-400 hover:text-white mb-3"
        >
          ← Back to clients
        </button>

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  client.tier === 'UHNW'
                    ? 'border-[#C9A84C] text-[#C9A84C]'
                    : 'border-blue-500 text-blue-400'
                }`}
              >
                {client.tier}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300">
                Decision Room
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <div className="text-[12px] text-gray-400">{client.company}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Health</div>
            <div
              className={`text-2xl font-bold font-mono ${
                (client.health ?? 0) >= 80
                  ? 'text-emerald-400'
                  : (client.health ?? 0) >= 60
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {client.health ?? '—'}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Last contact: {client.lastContact}</div>
          </div>
        </div>

        {/* ── Deal Stage Tracker ─────────────── */}
        {(() => {
          const currentStageIndex = DEAL_STAGES.findIndex(s => s.id === client.dealStage)
          return (
            <div className="flex items-center gap-0 mb-6 bg-[#111827] rounded-xl p-4 border border-[#1e2a3a]">
              {DEAL_STAGES.map((stage, i) => (
                <div key={stage.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      onClick={() => updateDealStage(stage.id)}
                      title={stage.desc}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold cursor-pointer transition ${
                        i < currentStageIndex
                          ? 'bg-[#1D9E75] text-white'
                          : i === currentStageIndex
                          ? 'bg-[#C9A84C] text-[#0D1117]'
                          : 'bg-[#1e2a3a] text-[#4a5568]'
                      }`}
                    >
                      {i < currentStageIndex ? '✓' : i + 1}
                    </div>
                    <div
                      className={`text-[9px] mt-1 font-medium text-center ${
                        i === currentStageIndex
                          ? 'text-[#C9A84C]'
                          : i < currentStageIndex
                          ? 'text-[#1D9E75]'
                          : 'text-[#4a5568]'
                      }`}
                    >
                      {stage.label}
                    </div>
                    {i === currentStageIndex && (
                      <div className="text-[8px] text-[#4a5568]">{client.daysInStage}d here</div>
                    )}
                  </div>
                  {i < DEAL_STAGES.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        i < currentStageIndex ? 'bg-[#1D9E75]' : 'bg-[#1e2a3a]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )
        })()}

        <div className="grid grid-cols-2 gap-6">
          {/* ── LEFT COLUMN ─ Client context ─────────────── */}
          <div className="space-y-4">
            <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Why they might be ready to buy
              </div>
              <div className="space-y-2 text-[12px]">
                <Row label="Wealth events (90d)" value={`${client.wealthEvents.length}`} />
                <Row
                  label="Health trend"
                  value={(client.health ?? 0) >= 80 ? 'Strong' : (client.health ?? 0) >= 60 ? 'Stable' : 'At risk'}
                />
                <Row label="Last contact" value={`${client.lastContactDays} days ago`} />
                <Row label="Active offers" value={String(client.activeOffers)} />
              </div>
              {client.wealthEvents.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#1e2a3a]/70">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Wealth events</div>
                  {client.wealthEvents.map((w, i) => (
                    <div key={i} className="text-[11px] text-gray-300 mb-1">
                      • {w.label}
                      {w.amount ? <span className="text-[#C9A84C]"> ({w.amount})</span> : null}
                      <span className="text-gray-500"> — {w.when}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {(() => {
              const score = client.health ?? 0
              const dims = [
                { label: 'Last contact', score: client.lastContactScore, max: 20, note: client.lastContactNote },
                { label: 'KPI delivery', score: client.kpiScore, max: 20, note: client.kpiNote },
                { label: 'Engagement', score: client.engagementScore, max: 20, note: client.engagementNote },
                { label: 'Wealth alignment', score: client.wealthAlignScore, max: 20, note: client.wealthNote },
                { label: 'Offer progress', score: client.offerProgressScore, max: 20, note: client.offerNote },
              ]
              return (
                <div className="bg-[#111827] rounded-lg p-4 mb-4 border border-[#1e2a3a]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[10px] font-semibold text-[#4a5568] uppercase tracking-wider">
                      Health score breakdown
                    </div>
                    <div
                      className="text-[22px] font-bold"
                      style={{
                        color: score >= 80 ? '#1D9E75' : score >= 60 ? '#C9A84C' : '#E24B4A',
                      }}
                    >
                      {score}
                    </div>
                  </div>
                  {dims.map((dim, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-[#8892a4]">{dim.label}</span>
                        <span
                          className="text-[10px] font-semibold"
                          style={{
                            color: dim.score >= 16 ? '#1D9E75' : dim.score >= 10 ? '#C9A84C' : '#E24B4A',
                          }}
                        >
                          {dim.score}/{dim.max}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#1e2a3a] rounded-full mb-1">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(dim.score / dim.max) * 100}%`,
                            background:
                              dim.score >= 16 ? '#1D9E75' : dim.score >= 10 ? '#C9A84C' : '#E24B4A',
                          }}
                        />
                      </div>
                      <div className="text-[9px] text-[#4a5568] leading-relaxed">{dim.note}</div>
                    </div>
                  ))}
                </div>
              )
            })()}

            <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Intelligence brief — Command AI
              </div>
              <ul className="text-[12px] text-gray-300 space-y-1.5 leading-relaxed">
                {client.intel.map((line, i) => (
                  <li key={i}>• {line}</li>
                ))}
              </ul>
            </section>

            <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Conversation history (last 5)
              </div>
              <div className="space-y-2 text-[12px]">
                {client.touchpoints.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex justify-between gap-3 border-b border-[#1e2a3a]/50 pb-1.5 last:border-0">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 mr-2">{t.type}</span>
                      <span className="text-gray-300">{t.desc}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{t.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT COLUMN ─ Decision tools ─────────────── */}
          <div className="space-y-4">
            <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#C9A84C] mb-2">
                Recommended next offer
              </div>
              <div className="text-[14px] font-semibold text-white">{client.matchedOffer.name}</div>
              <div className="text-[11px] text-gray-500 mt-1">
                Solves: {client.matchedProblem.name} · <span className="text-emerald-400">{client.matchedProblem.lifecycle}</span> · credibility {client.matchedProblem.credibility}
              </div>
              <div className="text-[20px] font-bold text-[#C9A84C] mt-2 font-mono">
                ${(client.matchedOffer.priceMonthly / 1000).toFixed(0)}K<span className="text-xs text-gray-500">/mo</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-2 leading-relaxed">{client.matchedOffer.rationale}</div>
            </section>

            <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Objection anticipator
              </div>
              <div className="space-y-3">
                {client.objections.map((o, i) => (
                  <div key={i} className="border-l-2 border-amber-500/40 pl-3">
                    <div className="text-[12px] text-amber-300 italic">{o.risk}</div>
                    <div className="text-[11px] text-gray-300 mt-1 leading-relaxed">{o.response}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-[#111827] rounded-lg p-4 border border-[#BA7517]/20">
              <div className="text-[10px] font-semibold text-[#BA7517] uppercase tracking-wider mb-3">
                Competitor intelligence
              </div>
              {client.competitors.map((comp, i) => (
                <div
                  key={i}
                  className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0 border-[#1e2a3a]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[12px] font-semibold text-[#e2e8f0]">{comp.name}</div>
                      <div className="text-[10px] text-[#4a5568]">
                        {comp.type}
                        {comp.daysSincePitch > 0 ? ` · Pitched ${comp.daysSincePitch}d ago` : ''}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                        comp.threat === 'high'
                          ? 'bg-[#1f0d0d] text-[#E24B4A]'
                          : comp.threat === 'medium'
                          ? 'bg-[#1f1500] text-[#BA7517]'
                          : 'bg-[#0F2E1A] text-[#1D9E75]'
                      }`}
                    >
                      {comp.threat === 'high'
                        ? 'High threat'
                        : comp.threat === 'medium'
                        ? 'Medium threat'
                        : 'Low threat'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8892a4] mb-2 leading-relaxed">
                    <strong className="text-[#e2e8f0]">What they offered:</strong> {comp.offering}
                  </div>
                  <div className="text-[10px] text-[#8892a4] mb-2 leading-relaxed">
                    <strong className="text-[#e2e8f0]">Their weakness:</strong> {comp.weakness}
                  </div>
                  <div className="bg-[#0F2E1A] border border-[#1D9E75]/20 rounded px-3 py-2">
                    <div className="text-[9px] font-semibold text-[#1D9E75] mb-1">
                      Your counter-position
                    </div>
                    <div className="text-[10px] text-[#5DCAA5] leading-relaxed">{comp.counterPosition}</div>
                  </div>
                </div>
              ))}
              <button className="w-full mt-2 py-1.5 text-[10px] border border-[#2a3a4a] text-[#8892a4] rounded-lg hover:border-[#C9A84C]/40 hover:text-[#C9A84C]">
                + Log new competitor
              </button>
            </div>

            <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Pitch opener</div>
              {pitchOpener ? (
                <div className="bg-[#0F2E1A] border border-[#1D9E75]/20 rounded-lg p-4">
                  <div className="text-[12px] text-[#5DCAA5] leading-relaxed italic mb-3">
                    &ldquo;{pitchOpener}&rdquo;
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard?.writeText(pitchOpener)}
                      className="text-[10px] border border-[#2a3a4a] text-[#8892a4] px-3 py-1.5 rounded"
                    >
                      Copy
                    </button>
                    <button
                      onClick={generatePitchOpener}
                      disabled={pitchLoading}
                      className="text-[10px] border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1.5 rounded disabled:opacity-60"
                    >
                      {pitchLoading ? 'Regenerating…' : 'Regenerate'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={generatePitchOpener}
                  disabled={pitchLoading}
                  className="px-4 py-2 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold disabled:opacity-60"
                >
                  {pitchLoading ? 'Generating...' : 'Generate'}
                </button>
              )}
            </section>

            <section className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Pre-meeting brief</div>
                {brief && (
                  <button
                    onClick={generateBrief}
                    disabled={briefLoading}
                    className="text-[10px] border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1.5 rounded disabled:opacity-60"
                  >
                    {briefLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                )}
              </div>
              {brief ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-[9px] font-semibold text-[#4a5568] uppercase tracking-wider mb-1">Client summary</div>
                    <div className="text-[11px] text-gray-200 leading-relaxed">{brief.summary}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold text-[#4a5568] uppercase tracking-wider mb-1">Pain signals</div>
                    {brief.painSignals.map((s, i) => (
                      <div key={i} className="flex gap-2 mb-1">
                        <span className="w-1 h-1 rounded-full bg-[#C9A84C] mt-1.5 flex-shrink-0" />
                        <div className="text-[10px] text-gray-300 leading-relaxed">{s}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold text-[#4a5568] uppercase tracking-wider mb-1">Conversation opener</div>
                    <div className="text-[10px] text-[#5DCAA5] italic leading-relaxed">&ldquo;{brief.opener}&rdquo;</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold text-[#4a5568] uppercase tracking-wider mb-1">Top 2 objections</div>
                    <div className="space-y-2">
                      {brief.objections.map((o, i) => (
                        <div key={i} className="border-l-2 border-amber-500/40 pl-3">
                          <div className="text-[11px] text-amber-300 italic">{o.risk}</div>
                          <div className="text-[10px] text-gray-300 mt-0.5 leading-relaxed">{o.response}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#0D1117] border border-[#C9A84C]/30 rounded p-3">
                    <div className="text-[9px] font-semibold text-[#C9A84C] uppercase tracking-wider mb-1">Closing proof point</div>
                    <div className="text-[11px] text-gray-200 leading-relaxed">{brief.proofPoint}</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={generateBrief}
                  disabled={briefLoading}
                  className="px-4 py-2 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold disabled:opacity-60"
                >
                  {briefLoading ? 'Generating...' : 'Generate'}
                </button>
              )}
            </section>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSchedule(true)}
                className="flex-1 bg-[#1e2a3a] text-gray-200 text-[12px] py-2 rounded-lg hover:bg-[#2a3a4a]"
              >
                Schedule next meeting
              </button>
              <button
                onClick={() => setShowLog(true)}
                disabled={decisionLogged}
                className="flex-1 bg-purple-900/50 text-purple-200 border border-purple-500/40 text-[12px] py-2 rounded-lg hover:bg-purple-900/70 disabled:opacity-60"
              >
                {decisionLogged ? 'Decision logged ✓' : 'Log this decision'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Schedule Meeting Modal ─────────────── */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowSchedule(false)}>
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-[14px] font-semibold text-[#e2e8f0] mb-4">Schedule next meeting</h3>

            <div className="mb-3">
              <label className="text-[10px] text-[#4a5568] uppercase tracking-wider">Meeting type</label>
              <select
                value={meetingType}
                onChange={e => setMeetingType(e.target.value)}
                className="w-full mt-1 bg-[#0D1117] border border-[#1e2a3a] text-[#e2e8f0] rounded-lg p-2 text-[12px]"
              >
                <option>Discovery follow-up</option>
                <option>Proposal presentation</option>
                <option>Contract review</option>
                <option>Quarterly review</option>
                <option>Relationship check-in</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="text-[10px] text-[#4a5568] uppercase tracking-wider">Date &amp; Time</label>
              <input
                type="datetime-local"
                value={meetingDateTime}
                onChange={e => setMeetingDateTime(e.target.value)}
                className="w-full mt-1 bg-[#0D1117] border border-[#1e2a3a] text-[#e2e8f0] rounded-lg p-2 text-[12px]"
              />
            </div>

            <div className="mb-4">
              <label className="text-[10px] text-[#4a5568] uppercase tracking-wider">Notes / agenda</label>
              <textarea
                rows={3}
                placeholder="Key topics to cover..."
                value={meetingAgenda}
                onChange={e => setMeetingAgenda(e.target.value)}
                className="w-full mt-1 bg-[#0D1117] border border-[#1e2a3a] text-[#e2e8f0] rounded-lg p-2 text-[12px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveMeeting}
                disabled={savingMeeting}
                className="flex-1 py-2 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold disabled:opacity-60"
              >
                {savingMeeting ? 'Saving…' : 'Schedule'}
              </button>
              <button
                onClick={() => setShowSchedule(false)}
                className="py-2 px-4 border border-[#2a3a4a] text-[#8892a4] rounded-lg text-[12px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Decision Modal ─────────────── */}
      {showLog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowLog(false)}>
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="text-[14px] font-semibold text-[#e2e8f0] mb-4">Log this decision session</h3>

            <div className="mb-3">
              <label className="text-[10px] text-[#4a5568] uppercase tracking-wider">Outcome</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {['Moving forward', 'Still evaluating', 'Needs more time', 'Not interested'].map(o => (
                  <button
                    key={o}
                    onClick={() => setLogOutcome(o)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] border transition ${
                      logOutcome === o
                        ? 'border-[#C9A84C] text-[#C9A84C] bg-[#1B2340]'
                        : 'border-[#2a3a4a] text-[#8892a4]'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-[10px] text-[#4a5568] uppercase tracking-wider">What happened</label>
              <textarea
                rows={3}
                placeholder="Key points discussed, commitments made, concerns raised..."
                value={logNotes}
                onChange={e => setLogNotes(e.target.value)}
                className="w-full mt-1 bg-[#0D1117] border border-[#1e2a3a] text-[#e2e8f0] rounded-lg p-2 text-[12px]"
              />
            </div>

            <div className="mb-4">
              <label className="text-[10px] text-[#4a5568] uppercase tracking-wider">Follow-up date</label>
              <input
                type="date"
                value={logFollowUp}
                onChange={e => setLogFollowUp(e.target.value)}
                className="w-full mt-1 bg-[#0D1117] border border-[#1e2a3a] text-[#e2e8f0] rounded-lg p-2 text-[12px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveDecisionLog}
                disabled={savingLog || !logOutcome}
                className="flex-1 py-2 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold disabled:opacity-60"
              >
                {savingLog ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setShowLog(false)}
                className="py-2 px-4 border border-[#2a3a4a] text-[#8892a4] rounded-lg text-[12px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-[#0F2E1A] border border-[#1D9E75]/40 text-[#1D9E75] px-4 py-3 rounded-lg shadow-2xl text-[12px]">
          {toast}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}

function buildFallbackBrief(client: ClientSummary, pitchOpener: string): BriefData {
  const topWealth = client.wealthEvents[0]
  return {
    summary: `${client.name} (${client.company}) is a ${client.tier} client, health ${client.health ?? '—'}, last contact ${client.lastContact}. Pain focus: ${client.painFocus.join(', ') || 'n/a'}.`,
    painSignals: [
      topWealth ? `Recent ${topWealth.label}${topWealth.amount ? ` (${topWealth.amount})` : ''} — ${topWealth.when}.` : client.intel[0] ?? 'Intelligence pipeline has not surfaced a priority signal yet.',
      client.intel[1] ?? 'No secondary intel point available.',
      client.intel[2] ?? 'No tertiary intel point available.',
    ],
    opener:
      pitchOpener ||
      `Open with the peer-family fraud event — ask how it landed with her team before pivoting to the retainer scope.`,
    objections: client.objections.slice(0, 2),
    proofPoint:
      'Median single-incident loss among UHNW households is $2.4M (FinCEN, 2025). One prevented incident pays for 7 years of retainer.',
  }
}
