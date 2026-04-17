'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopBar from '../../../components/shared/TopBar'
import CommandAIButton from '../../../components/shared/CommandAIButton'

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

interface OfferDraft {
  id: string
  name: string
  client: string
  tier: 'HNW' | 'UHNW'
  problemId: string
  problemName: string
  playbookId: string
  playbookName: string
  deliverables: { name: string; frequency: string; included: boolean }[]
  price: number
  pricingModel: 'monthly' | 'quarterly' | 'project'
  deliveryModel: 'Solo' | 'Team' | 'Orchestrated' | 'Tech-Assisted'
  kpis: { name: string; target: string; defined: boolean }[]
}

const STEPS: { id: WizardStep; label: string; hint: string }[] = [
  { id: 1, label: 'Basics', hint: 'Name, client, tier' },
  { id: 2, label: 'Problem & Playbook', hint: 'Match to evidence' },
  { id: 3, label: 'Value Stack', hint: 'Deliverables & frequency' },
  { id: 4, label: 'Pricing', hint: 'Price & model' },
  { id: 5, label: 'Delivery', hint: 'How it runs' },
  { id: 6, label: 'KPIs & Review', hint: 'Measure & publish' },
]

export default function EditOfferPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id ?? '')
  const [step, setStep] = useState<WizardStep>(3)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<OfferDraft | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/offers/${id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to load offer (${res.status})`)
        const data = await res.json()
        if (cancelled) return
        setDraft({
          id: data.id ?? id,
          name: data.name ?? '',
          client: data.client ?? '',
          tier: (data.tier as OfferDraft['tier']) ?? 'HNW',
          problemId: data.problemId ?? '',
          problemName: data.problemName ?? '',
          playbookId: data.playbookId ?? '',
          playbookName: data.playbookName ?? '',
          deliverables: data.deliverables ?? DEFAULT_DELIVERABLES,
          price: data.price ?? data.monthly ?? 0,
          pricingModel: data.pricingModel ?? 'monthly',
          deliveryModel: (data.deliveryModel ?? data.delivery ?? 'Team') as OfferDraft['deliveryModel'],
          kpis: data.kpis ?? DEFAULT_KPIS,
        })
      } catch (e) {
        if (cancelled) return
        // Fallback: use mock so edit flow still works against the offline stub.
        setDraft({
          id,
          name: `Offer #${id}`,
          client: 'Loaded client',
          tier: 'UHNW',
          problemId: 'prob-001',
          problemName: 'UHNW household cyber & impersonation risk',
          playbookId: 'pb-001',
          playbookName: 'Private Ops Office',
          deliverables: DEFAULT_DELIVERABLES,
          price: 22000,
          pricingModel: 'monthly',
          deliveryModel: 'Team',
          kpis: DEFAULT_KPIS,
        })
        setError(e instanceof Error ? e.message : 'Offer fetch failed — using draft fallback')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (id) load()
    return () => {
      cancelled = true
    }
  }, [id])

  const saveChanges = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await fetch(`/api/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      router.push('/offers')
    } catch {
      setSaving(false)
    }
  }

  if (loading || !draft) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white">
        <TopBar activePage="Offers" />
        <div className="px-6 py-20 text-center text-gray-500">Loading offer…</div>
      </div>
    )
  }

  const update = <K extends keyof OfferDraft>(k: K, v: OfferDraft[K]) =>
    setDraft(d => (d ? { ...d, [k]: v } : d))

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <TopBar activePage="Offers" />
      <CommandAIButton />

      <div className="px-6 py-5">
        {/* Editing banner */}
        <div className="bg-[#2a1d0a] border border-[#C9A84C]/40 rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#C9A84C] font-medium">Editing</div>
            <div className="text-[14px] text-white font-semibold">{draft.name}</div>
          </div>
          <button
            onClick={() => router.push('/offers')}
            className="text-[12px] text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-[#1f0d0d] border border-red-700/40 rounded-lg px-4 py-2 mb-4 text-[11px] text-red-400">
            {error}
          </div>
        )}

        {/* Step nav */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {STEPS.map(s => {
            const active = s.id === step
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`text-left px-3 py-2 rounded-lg border min-w-[140px] ${
                  active
                    ? 'bg-[#C9A84C]/10 border-[#C9A84C] text-[#C9A84C]'
                    : 'bg-[#111827] border-[#1e2a3a] text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider">Step {s.id}</div>
                <div className="text-[13px] font-semibold">{s.label}</div>
                <div className="text-[10px] text-gray-500">{s.hint}</div>
              </button>
            )
          })}
        </div>

        {/* Step body */}
        <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5 min-h-[420px]">
          {step === 1 && <Step1 draft={draft} update={update} />}
          {step === 2 && <Step2 draft={draft} update={update} />}
          {step === 3 && <Step3 draft={draft} update={update} />}
          {step === 4 && <Step4 draft={draft} update={update} />}
          {step === 5 && <Step5 draft={draft} update={update} />}
          {step === 6 && <Step6 draft={draft} />}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={() => setStep(s => (s > 1 ? ((s - 1) as WizardStep) : s))}
            disabled={step === 1}
            className="text-[12px] px-4 py-2 rounded-lg bg-[#111827] border border-[#1e2a3a] text-gray-300 disabled:opacity-40"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            {step < 6 ? (
              <button
                onClick={() => setStep(s => (s < 6 ? ((s + 1) as WizardStep) : s))}
                className="text-[12px] px-4 py-2 rounded-lg bg-[#1e2a3a] text-gray-200 hover:bg-[#2a3a4a]"
              >
                Next →
              </button>
            ) : null}
            <button
              onClick={saveChanges}
              disabled={saving}
              className="text-[12px] px-4 py-2 rounded-lg bg-[#C9A84C] text-[#0D1117] font-semibold hover:bg-[#C9A84C]/90 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_DELIVERABLES = [
  { name: 'Quarterly security audit', frequency: 'Quarterly', included: true },
  { name: 'Wire verification protocol', frequency: 'Per-transaction', included: true },
  { name: 'Staff vetting reports', frequency: 'Monthly', included: true },
  { name: 'Incident response standby', frequency: 'Continuous', included: true },
  { name: 'Quarterly red-team drill', frequency: 'Quarterly', included: false },
]

const DEFAULT_KPIS = [
  { name: 'Incidents detected / quarter', target: '≤ 3', defined: true },
  { name: 'Mean response time', target: '≤ 30 min', defined: true },
  { name: 'Staff vetting coverage', target: '100%', defined: true },
  { name: 'Client NPS', target: '≥ 60', defined: false },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      {children}
    </div>
  )
}

const input =
  'w-full bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none'

type StepProps = {
  draft: OfferDraft
  update: <K extends keyof OfferDraft>(k: K, v: OfferDraft[K]) => void
}

function Step1({ draft, update }: StepProps) {
  return (
    <div className="space-y-4 max-w-xl">
      <Field label="Offer name">
        <input className={input} value={draft.name} onChange={e => update('name', e.target.value)} />
      </Field>
      <Field label="Client">
        <input className={input} value={draft.client} onChange={e => update('client', e.target.value)} />
      </Field>
      <Field label="Tier">
        <select className={input} value={draft.tier} onChange={e => update('tier', e.target.value as OfferDraft['tier'])}>
          <option value="HNW">HNW</option>
          <option value="UHNW">UHNW</option>
        </select>
      </Field>
    </div>
  )
}

function Step2({ draft, update }: StepProps) {
  return (
    <div className="space-y-4 max-w-xl">
      <Field label="Problem">
        <input className={input} value={draft.problemName} onChange={e => update('problemName', e.target.value)} />
      </Field>
      <Field label="Playbook">
        <input className={input} value={draft.playbookName} onChange={e => update('playbookName', e.target.value)} />
      </Field>
    </div>
  )
}

function Step3({ draft, update }: StepProps) {
  const toggle = (i: number) => {
    const next = draft.deliverables.map((d, idx) => (idx === i ? { ...d, included: !d.included } : d))
    update('deliverables', next)
  }
  const updateField = (i: number, k: 'name' | 'frequency', v: string) => {
    const next = draft.deliverables.map((d, idx) => (idx === i ? { ...d, [k]: v } : d))
    update('deliverables', next)
  }
  return (
    <div className="space-y-3">
      <div className="text-[13px] text-gray-300 mb-2">Value stack — the deliverables that make up this offer.</div>
      {draft.deliverables.map((d, i) => (
        <div key={i} className="flex items-center gap-2 bg-[#0D1117] border border-[#1e2a3a] rounded-lg px-3 py-2">
          <input type="checkbox" checked={d.included} onChange={() => toggle(i)} className="accent-[#C9A84C]" />
          <input
            className="flex-1 bg-transparent text-[13px] focus:outline-none"
            value={d.name}
            onChange={e => updateField(i, 'name', e.target.value)}
          />
          <input
            className="w-32 bg-transparent text-[11px] text-gray-500 text-right focus:outline-none"
            value={d.frequency}
            onChange={e => updateField(i, 'frequency', e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

function Step4({ draft, update }: StepProps) {
  return (
    <div className="space-y-4 max-w-md">
      <Field label="Price">
        <input
          type="number"
          className={input}
          value={draft.price}
          onChange={e => update('price', Number(e.target.value) || 0)}
        />
      </Field>
      <Field label="Pricing model">
        <select
          className={input}
          value={draft.pricingModel}
          onChange={e => update('pricingModel', e.target.value as OfferDraft['pricingModel'])}
        >
          <option value="monthly">Monthly retainer</option>
          <option value="quarterly">Quarterly retainer</option>
          <option value="project">Project-based</option>
        </select>
      </Field>
    </div>
  )
}

function Step5({ draft, update }: StepProps) {
  return (
    <div className="space-y-4 max-w-md">
      <Field label="Delivery model">
        <select
          className={input}
          value={draft.deliveryModel}
          onChange={e => update('deliveryModel', e.target.value as OfferDraft['deliveryModel'])}
        >
          <option>Solo</option>
          <option>Team</option>
          <option>Orchestrated</option>
          <option>Tech-Assisted</option>
        </select>
      </Field>
    </div>
  )
}

function Step6({ draft }: { draft: OfferDraft }) {
  return (
    <div className="space-y-3 text-[12px]">
      <div className="text-[13px] text-gray-300 mb-2">Review everything before saving.</div>
      <Summary label="Name" value={draft.name} />
      <Summary label="Client" value={draft.client} />
      <Summary label="Tier" value={draft.tier} />
      <Summary label="Problem" value={draft.problemName} />
      <Summary label="Playbook" value={draft.playbookName} />
      <Summary label="Price" value={`$${(draft.price / 1000).toFixed(1)}K ${draft.pricingModel}`} />
      <Summary label="Delivery" value={draft.deliveryModel} />
      <Summary
        label="Deliverables"
        value={`${draft.deliverables.filter(d => d.included).length}/${draft.deliverables.length} included`}
      />
      <Summary label="KPIs" value={`${draft.kpis.filter(k => k.defined).length}/${draft.kpis.length} defined`} />
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-[#1e2a3a]/50 py-1">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}
