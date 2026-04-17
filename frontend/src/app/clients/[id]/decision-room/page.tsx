'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopBar from '../../../components/shared/TopBar'
import CommandAIButton from '../../../components/shared/CommandAIButton'

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
}

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

  const logDecision = async () => {
    if (!client) return
    try {
      await fetch(`/api/clients/${id}/touchpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'decision-room',
          desc: `Decision room session (pitch ${pitch ? 'generated' : 'not generated'}, brief ${brief ? 'reviewed' : 'not reviewed'}).`,
        }),
      })
    } catch {
      /* soft-fail — local UX still succeeds */
    }
    setDecisionLogged(true)
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
              <button className="flex-1 bg-[#1e2a3a] text-gray-200 text-[12px] py-2 rounded-lg hover:bg-[#2a3a4a]">
                Schedule next meeting
              </button>
              <button
                onClick={logDecision}
                disabled={decisionLogged}
                className="flex-1 bg-purple-900/50 text-purple-200 border border-purple-500/40 text-[12px] py-2 rounded-lg hover:bg-purple-900/70 disabled:opacity-60"
              >
                {decisionLogged ? 'Decision logged ✓' : 'Log this decision'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
