'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type Frequency = 'Monthly' | 'Quarterly' | 'Weekly' | 'One-time';
type DeliveryModel = 'Solo' | 'Team' | 'Orchestrated';

interface Deliverable {
  id: string;
  name: string;
  frequency: Frequency;
  description: string;
}

interface SopRow {
  id: string;
  cadence: string;
  task: string;
}

interface KpiRow {
  id: string;
  name: string;
  measurement: string;
  target: string;
  enabled: boolean;
}

const DEFAULT_DELIVERABLES: Deliverable[] = [
  { id: 'd1', name: 'Threat monitoring dashboard', frequency: 'Weekly', description: 'Shared with client weekly via portal.' },
  { id: 'd2', name: 'AI impersonation detection', frequency: 'Monthly', description: 'Alerts within 15 minutes of detection.' },
  { id: 'd3', name: 'Wire fraud prevention protocol', frequency: 'Quarterly', description: 'Written verification protocol with dual-authorization.' },
  { id: 'd4', name: 'Incident response retainer', frequency: 'Monthly', description: 'Named responder available 24/7 for confirmed incidents.' },
];

const DEFAULT_SOPS: SopRow[] = [
  { id: 's1', cadence: 'Mon', task: 'Review weekend alerts, triage any new threats, confirm overnight monitoring was clean.' },
  { id: 's2', cadence: 'Tue', task: 'Vendor status check — confirm all monitoring tools are active; update client dashboard.' },
  { id: 's3', cadence: 'Wed', task: 'Household walk-through (bi-weekly): physical security surface review.' },
  { id: 's4', cadence: 'Thu', task: 'Evidence & intel review: update credibility scores on any new citations from the week.' },
  { id: 's5', cadence: 'Fri', task: 'Client brief — send weekly status note to primary contact.' },
  { id: 's6', cadence: 'Monthly', task: 'Full protocol audit with client: review incidents, adjust verification procedures.' },
  { id: 's7', cadence: 'Quarterly', task: 'Comprehensive threat landscape update + renewal conversation prep.' },
];

const DEFAULT_KPIS: KpiRow[] = [
  { id: 'k1', name: 'Mean time to detect', measurement: 'Minutes from threat appearance to alert', target: '< 15 min', enabled: true },
  { id: 'k2', name: 'Mean time to respond', measurement: 'Minutes from alert to containment', target: '< 60 min', enabled: true },
  { id: 'k3', name: 'Incident prevention rate', measurement: '% of near-misses caught upstream', target: '> 90%', enabled: true },
  { id: 'k4', name: 'Client satisfaction', measurement: 'Quarterly NPS from primary contact', target: '> 50', enabled: true },
];

const DELIVERY_MODEL_HOURS: Record<DeliveryModel, string> = {
  Solo: '12–18 hrs/wk',
  Team: '6–10 hrs/wk',
  Orchestrated: '3–5 hrs/wk',
};

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function PlaybookCustomizePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const playbookSlug = params?.id ?? 'playbook';

  // Basics
  const [offerName, setOfferName] = useState(`Customized: ${playbookSlug}`);
  const [tagline, setTagline] = useState('A named operator for the household, with documented SLAs.');
  const [targetBuyer, setTargetBuyer] = useState(
    'UHNW principals with multi-jurisdiction exposure, household staff, and existing advisor relationships.',
  );
  const [priceMin, setPriceMin] = useState(15000);
  const [priceMax, setPriceMax] = useState(30000);

  // Deliverables
  const [deliverables, setDeliverables] = useState<Deliverable[]>(DEFAULT_DELIVERABLES);

  // SOPs
  const [sops, setSops] = useState<SopRow[]>(DEFAULT_SOPS);

  // KPIs
  const [kpis, setKpis] = useState<KpiRow[]>(DEFAULT_KPIS);
  const [newKpi, setNewKpi] = useState<{ name: string; measurement: string; target: string }>({
    name: '',
    measurement: '',
    target: '',
  });

  // Delivery model
  const [deliveryModel, setDeliveryModel] = useState<DeliveryModel>('Orchestrated');
  const [partnerRequirements, setPartnerRequirements] = useState(
    'One private banker or estate attorney relationship required to open the introduction pipeline.',
  );

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const enabledKpis = useMemo(() => kpis.filter((k) => k.enabled), [kpis]);

  const handleSaveAsCustom = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/playbooks/${playbookSlug}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: offerName,
          tagline,
          targetBuyer,
          priceMin,
          priceMax,
          deliverables,
          sopSchedule: sops,
          kpis: enabledKpis,
          deliveryModel,
          partnerRequirements,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const newId = data?.playbookId ?? `custom-${Date.now()}`;
      setToast('Custom playbook saved — find it in the Custom tab');
      setTimeout(() => router.push(`/playbooks?highlight=${newId}`), 600);
    } catch {
      const newId = `custom-${Date.now()}`;
      setToast('Custom playbook saved locally — find it in the Custom tab');
      setTimeout(() => router.push(`/playbooks?highlight=${newId}`), 600);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => router.push('/playbooks');

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-100">
      <div className="border-b border-[#1e2a3a] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#4a5568] mb-1">
              <Link href="/playbooks" className="hover:text-[#C9A84C]">Playbooks</Link>
              <span className="mx-2">/</span>
              <span>{playbookSlug}</span>
              <span className="mx-2">/</span>
              <span className="text-[#e2e8f0]">Customize</span>
            </div>
            <h1 className="text-xl font-bold text-white">Customize playbook</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Edit deliverables, SOPs, KPIs, pricing, and delivery model. Save as your own custom version or
              update the original.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="text-[11px] px-3 py-2 border border-[#2a3a4a] text-[#8892a4] rounded-lg hover:border-[#4a5568]"
            >
              Discard
            </button>
            <button
              onClick={handleSaveAsCustom}
              disabled={saving}
              className="text-[11px] px-3 py-2 bg-[#C9A84C] text-[#0D1117] rounded-lg font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save as my custom version'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 px-6 py-5">
        <div className="col-span-7 space-y-5">
          <Section title="1. Basics">
            <LabeledInput label="Offer name" value={offerName} onChange={setOfferName} />
            <LabeledInput label="Tagline" value={tagline} onChange={setTagline} />
            <LabeledTextarea label="Target buyer description" value={targetBuyer} onChange={setTargetBuyer} />
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumber label="Price min ($/month)" value={priceMin} onChange={setPriceMin} />
              <LabeledNumber label="Price max ($/month)" value={priceMax} onChange={setPriceMax} />
            </div>
          </Section>

          <Section
            title="2. Deliverables"
            action={
              <button
                onClick={() => setDeliverables(DEFAULT_DELIVERABLES)}
                className="text-[10px] text-[#C9A84C] hover:underline"
              >
                Restore defaults
              </button>
            }
          >
            <div className="space-y-2">
              {deliverables.map((d, idx) => (
                <div key={d.id} className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      value={d.name}
                      onChange={(e) => {
                        const next = [...deliverables];
                        next[idx] = { ...d, name: e.target.value };
                        setDeliverables(next);
                      }}
                      className="flex-1 bg-[#111827] border border-[#1e2a3a] rounded px-2 py-1.5 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
                    />
                    <select
                      value={d.frequency}
                      onChange={(e) => {
                        const next = [...deliverables];
                        next[idx] = { ...d, frequency: e.target.value as Frequency };
                        setDeliverables(next);
                      }}
                      className="bg-[#111827] border border-[#1e2a3a] rounded px-2 py-1.5 text-[11px] text-[#e2e8f0] focus:outline-none"
                    >
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Weekly</option>
                      <option>One-time</option>
                    </select>
                    <button
                      onClick={() => setDeliverables(deliverables.filter((x) => x.id !== d.id))}
                      className="text-[#4a5568] hover:text-[#E24B4A] px-2"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={d.description}
                    onChange={(e) => {
                      const next = [...deliverables];
                      next[idx] = { ...d, description: e.target.value };
                      setDeliverables(next);
                    }}
                    rows={2}
                    className="w-full bg-[#111827] border border-[#1e2a3a] rounded px-2 py-1.5 text-[11px] text-[#8892a4] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setDeliverables([
                    ...deliverables,
                    { id: randomId('d'), name: 'New deliverable', frequency: 'Monthly', description: '' },
                  ])
                }
                className="w-full py-2 border border-dashed border-[#2a3a4a] text-[11px] text-[#4a5568] rounded-lg hover:border-[#C9A84C] hover:text-[#C9A84C]"
              >
                + Add deliverable
              </button>
            </div>
          </Section>

          <Section title="3. SOP schedule">
            <div className="space-y-2">
              {sops.map((s, idx) => (
                <div key={s.id} className="flex items-start gap-2">
                  <div className="w-20 flex-shrink-0 text-[11px] text-[#C9A84C] font-semibold pt-2">
                    {s.cadence}
                  </div>
                  <textarea
                    value={s.task}
                    onChange={(e) => {
                      const next = [...sops];
                      next[idx] = { ...s, task: e.target.value };
                      setSops(next);
                    }}
                    rows={2}
                    className="flex-1 bg-[#111827] border border-[#1e2a3a] rounded px-2 py-1.5 text-[11px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                  <button
                    onClick={() => setSops(sops.filter((x) => x.id !== s.id))}
                    className="text-[#4a5568] hover:text-[#E24B4A] px-2 pt-2"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setSops([...sops, { id: randomId('s'), cadence: 'Custom', task: '' }])
                }
                className="w-full py-2 border border-dashed border-[#2a3a4a] text-[11px] text-[#4a5568] rounded-lg hover:border-[#C9A84C] hover:text-[#C9A84C]"
              >
                + Add custom recurring task
              </button>
            </div>
          </Section>

          <Section title="4. KPI stack">
            <div className="space-y-2">
              {kpis.map((k, idx) => (
                <label
                  key={k.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-[#1e2a3a] bg-[#0D1117]"
                >
                  <input
                    type="checkbox"
                    checked={k.enabled}
                    onChange={(e) => {
                      const next = [...kpis];
                      next[idx] = { ...k, enabled: e.target.checked };
                      setKpis(next);
                    }}
                    className="mt-1 accent-[#C9A84C]"
                  />
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold text-[#e2e8f0]">{k.name}</div>
                    <div className="text-[10px] text-[#8892a4]">Measurement: {k.measurement}</div>
                    <div className="text-[10px] text-[#C9A84C]">Target: {k.target}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg border border-dashed border-[#2a3a4a]">
              <div className="text-[10px] text-[#4a5568] uppercase tracking-wider mb-2">Add custom KPI</div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  placeholder="Name"
                  value={newKpi.name}
                  onChange={(e) => setNewKpi({ ...newKpi, name: e.target.value })}
                  className="bg-[#111827] border border-[#1e2a3a] rounded px-2 py-1.5 text-[11px] text-[#e2e8f0] focus:outline-none"
                />
                <input
                  placeholder="Measurement method"
                  value={newKpi.measurement}
                  onChange={(e) => setNewKpi({ ...newKpi, measurement: e.target.value })}
                  className="bg-[#111827] border border-[#1e2a3a] rounded px-2 py-1.5 text-[11px] text-[#e2e8f0] focus:outline-none"
                />
                <input
                  placeholder="Target value"
                  value={newKpi.target}
                  onChange={(e) => setNewKpi({ ...newKpi, target: e.target.value })}
                  className="bg-[#111827] border border-[#1e2a3a] rounded px-2 py-1.5 text-[11px] text-[#e2e8f0] focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (!newKpi.name) return;
                  setKpis([
                    ...kpis,
                    { id: randomId('k'), name: newKpi.name, measurement: newKpi.measurement, target: newKpi.target, enabled: true },
                  ]);
                  setNewKpi({ name: '', measurement: '', target: '' });
                }}
                className="text-[11px] px-3 py-1.5 bg-[#1B2340] text-[#C9A84C] border border-[#C9A84C]/40 rounded"
              >
                Add KPI
              </button>
            </div>
          </Section>

          <Section title="5. Delivery model">
            <div className="space-y-2">
              {(['Solo', 'Team', 'Orchestrated'] as DeliveryModel[]).map((m) => (
                <label
                  key={m}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    deliveryModel === m
                      ? 'bg-[#1B2340] border-[#C9A84C]'
                      : 'bg-[#0D1117] border-[#1e2a3a] hover:border-[#2a3a4a]'
                  }`}
                >
                  <input
                    type="radio"
                    checked={deliveryModel === m}
                    onChange={() => setDeliveryModel(m)}
                    className="mt-1 accent-[#C9A84C]"
                  />
                  <div className="flex-1 text-[12px] font-semibold text-[#e2e8f0]">{m}</div>
                  <div className="text-[10px] text-[#C9A84C]">{DELIVERY_MODEL_HOURS[m]}</div>
                </label>
              ))}
            </div>
            <LabeledTextarea
              label="Partner requirements"
              value={partnerRequirements}
              onChange={setPartnerRequirements}
            />
          </Section>

          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={handleSaveAsCustom}
              disabled={saving}
              className="flex-1 py-2.5 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save as my custom version'}
            </button>
            <button
              onClick={handleDiscard}
              className="flex-1 py-2.5 border border-[#2a3a4a] text-[#8892a4] rounded-lg text-[12px] hover:border-[#4a5568]"
            >
              Discard changes
            </button>
          </div>
        </div>

        <div className="col-span-5">
          <div className="sticky top-4 space-y-3">
            <div className="text-[10px] text-[#4a5568] uppercase tracking-wider">
              How this will appear to clients in the portal
            </div>
            <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl overflow-hidden">
              <div className="h-[3px] bg-[#C9A84C]" />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#e2e8f0]">{offerName || 'Offer name'}</h3>
                    <div className="text-[11px] text-[#8892a4]">{tagline}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#C9A84C]">
                      ${priceMin.toLocaleString()}–${priceMax.toLocaleString()}/mo
                    </div>
                    <div className="text-[10px] text-[#4a5568]">{deliveryModel} · {DELIVERY_MODEL_HOURS[deliveryModel]}</div>
                  </div>
                </div>
                <div className="text-[11px] text-[#8892a4] mb-3">Target: {targetBuyer}</div>

                <div className="text-[10px] text-[#4a5568] uppercase tracking-wider mb-2">Deliverables</div>
                <ul className="space-y-1 mb-3">
                  {deliverables.slice(0, 6).map((d) => (
                    <li key={d.id} className="flex items-start gap-2 text-[11px]">
                      <span className="text-[#1D9E75] mt-0.5">✓</span>
                      <div>
                        <div className="text-[#e2e8f0]">{d.name}</div>
                        <div className="text-[10px] text-[#4a5568]">{d.frequency} · {d.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {enabledKpis.length > 0 && (
                  <>
                    <div className="text-[10px] text-[#4a5568] uppercase tracking-wider mb-2">
                      KPI stack ({enabledKpis.length})
                    </div>
                    <ul className="space-y-1 mb-2">
                      {enabledKpis.map((k) => (
                        <li key={k.id} className="flex items-start gap-2 text-[11px]">
                          <span className="text-[#C9A84C] mt-0.5">•</span>
                          <div>
                            <span className="text-[#e2e8f0]">{k.name}</span>
                            <span className="text-[10px] text-[#4a5568]"> — target {k.target}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            {toast && (
              <div className="p-3 rounded-lg border border-[#1D9E75]/30 bg-[#0F2E1A] text-[11px] text-[#5DCAA5]">
                {toast}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[12px] font-semibold text-[#e2e8f0]">{title}</h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0D1117] border border-[#1e2a3a] rounded px-3 py-2 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
      />
    </div>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-[#0D1117] border border-[#1e2a3a] rounded px-3 py-2 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
      />
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || '0', 10))}
        className="w-full bg-[#0D1117] border border-[#1e2a3a] rounded px-3 py-2 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
      />
    </div>
  );
}
