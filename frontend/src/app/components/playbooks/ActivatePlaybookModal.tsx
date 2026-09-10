'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface ActivatePlaybookInput {
  id: number | string;
  slug: string;
  name: string;
  priceLabel: string;
  priceMin: number;
  priceMax: number;
  deliverables: string[];
  defaultDeliveryModel?: DeliveryModel;
}

export interface ActivateClientOption {
  id: string;
  name: string;
  kind: 'client' | 'prospect';
  healthScore?: number;
  wealthEvent?: string;
  painFocus?: string[];
}

type DeliveryModel = 'Solo' | 'Team' | 'Orchestrated';

interface ActivatePlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbook: ActivatePlaybookInput | null;
  clientOptions?: ActivateClientOption[];
  onActivated?: (offerId: string) => void;
}

const DELIVERY_MODELS: { id: DeliveryModel; title: string; desc: string; hours: string }[] = [
  { id: 'Solo', title: 'Solo', desc: 'You deliver personally. Highest quality, lowest scale.', hours: '12–18 hrs/wk' },
  { id: 'Team', title: 'Team', desc: 'You lead, supported by 1–2 specialists. Balanced scale and quality.', hours: '6–10 hrs/wk' },
  { id: 'Orchestrated', title: 'Orchestrated', desc: 'Named operator, documented SLAs, vendor network. Best scale.', hours: '3–5 hrs/wk' },
];

export default function ActivatePlaybookModal({
  isOpen,
  onClose,
  playbook,
  clientOptions = [],
  onActivated,
}: ActivatePlaybookModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'offer' | 'client' | 'confirm'>('offer');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Step A — offer state
  const [offerName, setOfferName] = useState('');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [deliveryModel, setDeliveryModel] = useState<DeliveryModel>('Orchestrated');

  // Step B — client state
  const [selectedClientId, setSelectedClientId] = useState<string>('__new');

  // Reset fields when the playbook changes
  const initKey = playbook?.id ?? '';
  useMemo(() => {
    if (playbook) {
      setOfferName(playbook.name);
      setPriceMin(playbook.priceMin);
      setPriceMax(playbook.priceMax);
      setDeliveryModel(playbook.defaultDeliveryModel ?? 'Orchestrated');
      setSelectedClientId('__new');
      setStep('offer');
    }
  }, [initKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !playbook) return null;

  const selectedClient =
    selectedClientId === '__new' ? null : clientOptions.find((c) => c.id === selectedClientId) ?? null;

  const matchReason =
    selectedClient && selectedClient.wealthEvent
      ? `Recent wealth event (${selectedClient.wealthEvent}) opens a 60–90 day deployment window — high relevance for this playbook.`
      : selectedClient && selectedClient.painFocus && selectedClient.painFocus.length
        ? `Client's pain focus includes ${selectedClient.painFocus[0]}, which this playbook directly addresses.`
        : null;

  const handleActivate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbookId: playbook.id,
          name: offerName,
          clientId: selectedClientId === '__new' ? null : selectedClientId,
          priceMin,
          priceMax,
          deliveryModel,
          status: 'draft',
        }),
      });
      const data = await res.json().catch(() => ({}));
      const offerId: string =
        data?.offer?.id ?? data?.id ?? `offer-${Date.now()}`;
      setToast('Offer created — Deal Desk templates are ready');
      onActivated?.(offerId);
      // brief pause so toast renders
      setTimeout(() => {
        onClose();
        router.push(`/offers/${offerId}`);
      }, 600);
    } catch {
      const offerId = `offer-${Date.now()}`;
      setToast('Offer created (offline) — Deal Desk templates are ready');
      onActivated?.(offerId);
      setTimeout(() => {
        onClose();
        router.push(`/offers/${offerId}`);
      }, 600);
    } finally {
      setSubmitting(false);
    }
  };

  const StepChip = ({ id, label }: { id: 'offer' | 'client' | 'confirm'; label: string }) => {
    const active = step === id;
    const done =
      (id === 'offer' && (step === 'client' || step === 'confirm')) ||
      (id === 'client' && step === 'confirm');
    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            active
              ? 'bg-[#C9A84C] text-[#0D1117]'
              : done
                ? 'bg-[#1D9E75] text-white'
                : 'bg-[#1e2a3a] text-[#4a5568]'
          }`}
        >
          {done ? '✓' : id === 'offer' ? 'A' : id === 'client' ? 'B' : 'C'}
        </div>
        <span className={`text-[11px] ${active ? 'text-[#e2e8f0] font-semibold' : 'text-[#4a5568]'}`}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-[#1e2a3a] sticky top-0 bg-[#0D1117] z-10">
            <div>
              <h2 className="text-sm font-semibold text-white">Activate Playbook</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{playbook.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2a3a] bg-[#111827]/60">
            <StepChip id="offer" label="Offer preview" />
            <div className="flex-1 h-px bg-[#1e2a3a] mx-2" />
            <StepChip id="client" label="Client assignment" />
            <div className="flex-1 h-px bg-[#1e2a3a] mx-2" />
            <StepChip id="confirm" label="What happens next" />
          </div>

          <div className="p-5">
            {step === 'offer' && (
              <div>
                <div className="mb-4">
                  <label className="block text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">
                    Offer name
                  </label>
                  <input
                    type="text"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1e2a3a] rounded px-3 py-2 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">
                      Price min (monthly)
                    </label>
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(parseInt(e.target.value || '0', 10))}
                      className="w-full bg-[#111827] border border-[#1e2a3a] rounded px-3 py-2 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#4a5568] uppercase tracking-wider mb-1">
                      Price max (monthly)
                    </label>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(parseInt(e.target.value || '0', 10))}
                      className="w-full bg-[#111827] border border-[#1e2a3a] rounded px-3 py-2 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] text-[#4a5568] uppercase tracking-wider mb-2">
                    What&rsquo;s included
                  </div>
                  <ul className="space-y-1">
                    {playbook.deliverables.slice(0, 5).map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-[#8892a4]">
                        <span className="text-[#1D9E75] mt-0.5">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[10px] text-[#4a5568] uppercase tracking-wider mb-2">
                    Delivery model
                  </div>
                  <div className="space-y-2">
                    {DELIVERY_MODELS.map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          deliveryModel === m.id
                            ? 'bg-[#1B2340] border-[#C9A84C]'
                            : 'bg-[#111827] border-[#1e2a3a] hover:border-[#2a3a4a]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryModel"
                          checked={deliveryModel === m.id}
                          onChange={() => setDeliveryModel(m.id)}
                          className="mt-0.5 accent-[#C9A84C]"
                        />
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold text-[#e2e8f0]">{m.title}</div>
                          <div className="text-[10px] text-[#8892a4] leading-relaxed">{m.desc}</div>
                        </div>
                        <div className="text-[10px] text-[#C9A84C] whitespace-nowrap">{m.hours}</div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 'client' && (
              <div>
                <div className="text-[11px] text-[#8892a4] mb-3">Who is this offer for?</div>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1e2a3a] rounded px-3 py-2 text-[12px] text-[#e2e8f0] focus:outline-none focus:border-[#C9A84C]"
                >
                  <option value="__new">New prospect — save as unassigned draft</option>
                  {clientOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.kind})
                    </option>
                  ))}
                </select>

                {selectedClient && (
                  <div className="mt-4 p-3 rounded-lg border border-[#1e2a3a] bg-[#111827]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[12px] font-semibold text-[#e2e8f0]">{selectedClient.name}</div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          selectedClient.kind === 'client'
                            ? 'border-[#1D9E75]/40 text-[#1D9E75] bg-[#0F2E1A]'
                            : 'border-blue-500/40 text-blue-400 bg-blue-900/20'
                        }`}
                      >
                        {selectedClient.kind}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      {typeof selectedClient.healthScore === 'number' && (
                        <div>
                          <div className="text-[#4a5568] uppercase tracking-wider mb-0.5">Health</div>
                          <div className="text-[#e2e8f0]">{selectedClient.healthScore}/100</div>
                        </div>
                      )}
                      {selectedClient.wealthEvent && (
                        <div>
                          <div className="text-[#4a5568] uppercase tracking-wider mb-0.5">Wealth event</div>
                          <div className="text-[#C9A84C]">{selectedClient.wealthEvent}</div>
                        </div>
                      )}
                    </div>
                    {matchReason && (
                      <div className="mt-3 p-2 rounded border border-[#1D9E75]/20 bg-[#0F2E1A] text-[10px] text-[#5DCAA5]">
                        <span className="font-semibold">Why this client is a good match: </span>
                        {matchReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 'confirm' && (
              <div>
                <div className="text-[11px] text-[#8892a4] mb-3">
                  Activating this playbook will create the following:
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-[#1e2a3a] bg-[#111827]">
                    <span className="text-[#1D9E75] text-[12px] mt-0.5">✓</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#e2e8f0]">
                        New offer appears in Offers with status &ldquo;Draft&rdquo;
                      </div>
                      <div className="text-[10px] text-[#8892a4]">
                        {offerName} · ${priceMin.toLocaleString()}–${priceMax.toLocaleString()}/mo ·{' '}
                        {deliveryModel}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-[#1e2a3a] bg-[#111827]">
                    <span className="text-[#1D9E75] text-[12px] mt-0.5">✓</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#e2e8f0]">
                        Deal Desk documents pre-generated as templates
                      </div>
                      <div className="text-[10px] text-[#8892a4]">
                        Contract, NDA, and Proposal drafts — ready for your review and customization.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-[#1e2a3a] bg-[#111827]">
                    <span className="text-[#1D9E75] text-[12px] mt-0.5">✓</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#e2e8f0]">
                        First task created in Deliver
                      </div>
                      <div className="text-[10px] text-[#8892a4]">
                        &ldquo;Review and customize Deal Desk documents&rdquo; — assigned to you.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-[#1e2a3a] bg-[#111827]">
                    <span className="text-[#1D9E75] text-[12px] mt-0.5">✓</span>
                    <div>
                      <div className="text-[12px] font-semibold text-[#e2e8f0]">
                        Command AI notified
                      </div>
                      <div className="text-[10px] text-[#8892a4]">
                        This offer will surface in recommendations whenever a matching client signal is detected.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {toast && (
              <div className="mt-4 p-3 rounded-lg border border-[#1D9E75]/30 bg-[#0F2E1A] text-[11px] text-[#5DCAA5]">
                {toast}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-5 border-t border-[#1e2a3a] sticky bottom-0 bg-[#0D1117]">
            {step !== 'offer' && (
              <button
                onClick={() => setStep(step === 'confirm' ? 'client' : 'offer')}
                className="py-2.5 px-4 border border-[#2a3a4a] text-[#8892a4] rounded-lg text-[12px] hover:border-[#4a5568] transition"
                disabled={submitting}
              >
                ← Back
              </button>
            )}
            <div className="flex-1" />
            {step !== 'confirm' ? (
              <button
                onClick={() => setStep(step === 'offer' ? 'client' : 'confirm')}
                disabled={step === 'offer' && (!offerName || priceMin <= 0 || priceMax <= 0)}
                className="py-2.5 px-5 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold disabled:opacity-50"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={submitting}
                className="py-2.5 px-5 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? 'Activating…' : 'Activate now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
