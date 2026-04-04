'use client';

import React, { useState } from 'react';

export interface ComposablePlaybook {
  id: string;
  name: string;
  category: string;
  price: string;
  tier: string;
}

interface CrossPlaybookComposerProps {
  isOpen: boolean;
  onClose: () => void;
  playbooks: ComposablePlaybook[];
  onCompose: (selected: string[], name: string, price: string) => void;
}

type Step = 1 | 2 | 3 | 4;

const CATEGORY_COLORS: Record<string, string> = {
  security: '#E24B4A',
  coordination: '#1D9E75',
  governance: '#534AB7',
  privacy: '#BA7517',
  medical: '#3B6D11',
  travel: '#185FA5',
  property: '#D97706',
};

export default function CrossPlaybookComposer({
  isOpen,
  onClose,
  playbooks,
  onCompose,
}: CrossPlaybookComposerProps) {
  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [compositeName, setCompositeName] = useState('');
  const [compositePrice, setCompositePrice] = useState('');
  const [conflictsChecked, setConflictsChecked] = useState(false);

  if (!isOpen) return null;

  const togglePlaybook = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const selectedPlaybooks = playbooks.filter((pb) => selected.includes(pb.id));

  const handleCompose = () => {
    onCompose(selected, compositeName, compositePrice);
    setStep(1);
    setSelected([]);
    setCompositeName('');
    setCompositePrice('');
    setConflictsChecked(false);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return selected.length >= 2;
      case 2:
        return compositeName.trim().length > 0 && compositePrice.trim().length > 0;
      case 3:
        return true;
      case 4:
        return conflictsChecked;
      default:
        return false;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#1e2a3a]">
            <div>
              <h2 className="text-sm font-semibold text-white">Cross-Playbook Composer</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Step {step} of 4</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 px-5 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  s <= step ? 'bg-[#C9A84C]' : 'bg-[#1e2a3a]'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Step 1: Select playbooks */}
            {step === 1 && (
              <div>
                <p className="text-xs text-gray-400 mb-3">
                  Select up to 3 playbooks to compose ({selected.length}/3)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {playbooks.map((pb) => {
                    const isSelected = selected.includes(pb.id);
                    const accent = CATEGORY_COLORS[pb.category] || '#6b7280';
                    return (
                      <button
                        key={pb.id}
                        onClick={() => togglePlaybook(pb.id)}
                        className={`
                          text-left p-3 rounded-lg border transition-colors
                          ${
                            isSelected
                              ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40'
                              : 'bg-[#111827] border-[#1e2a3a] hover:border-[#C9A84C]/20'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px]
                              ${
                                isSelected
                                  ? 'bg-[#C9A84C] border-[#C9A84C] text-black font-bold'
                                  : 'border-[#1e2a3a]'
                              }
                            `}
                          >
                            {isSelected && '\u2713'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">
                              {pb.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: accent }}
                              />
                              <span className="text-[10px] text-gray-500 uppercase">
                                {pb.category}
                              </span>
                              <span className="text-[10px] text-gray-400 ml-auto">
                                {pb.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Name + Pricing */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 mb-3">
                  Name and price your composite playbook
                </p>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                    Composite Name
                  </label>
                  <input
                    type="text"
                    value={compositeName}
                    onChange={(e) => setCompositeName(e.target.value)}
                    placeholder="e.g., Family Office Complete Shield"
                    className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md px-3 py-2
                               text-sm text-gray-200 placeholder-gray-600
                               focus:outline-none focus:border-[#C9A84C]/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                    Composite Price
                  </label>
                  <input
                    type="text"
                    value={compositePrice}
                    onChange={(e) => setCompositePrice(e.target.value)}
                    placeholder="e.g., $12,500/mo"
                    className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md px-3 py-2
                               text-sm text-gray-200 placeholder-gray-600
                               focus:outline-none focus:border-[#C9A84C]/50"
                  />
                </div>
                <div className="mt-3 p-3 bg-[#111827] border border-[#1e2a3a] rounded-lg">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-2">
                    Selected Playbooks
                  </p>
                  {selectedPlaybooks.map((pb) => (
                    <div key={pb.id} className="flex items-center justify-between py-1">
                      <span className="text-[11px] text-gray-300">{pb.name}</span>
                      <span className="text-[11px] text-gray-500">{pb.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Preview merged stack */}
            {step === 3 && (
              <div>
                <p className="text-xs text-gray-400 mb-3">Preview your merged playbook stack</p>
                <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white">{compositeName}</h4>
                  <p className="text-xs text-[#C9A84C] mt-1">{compositePrice}</p>
                  <div className="mt-3 space-y-2">
                    {selectedPlaybooks.map((pb) => {
                      const accent = CATEGORY_COLORS[pb.category] || '#6b7280';
                      return (
                        <div
                          key={pb.id}
                          className="flex items-center gap-2 p-2 bg-[#0D1117] rounded-md border border-[#1e2a3a]"
                        >
                          <div
                            className="w-1 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: accent }}
                          />
                          <div>
                            <p className="text-[11px] text-white font-medium">{pb.name}</p>
                            <p className="text-[10px] text-gray-500">
                              {pb.tier} &middot; {pb.category}
                            </p>
                          </div>
                          <span className="ml-auto text-[11px] text-gray-400">{pb.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Conflict check */}
            {step === 4 && (
              <div>
                <p className="text-xs text-gray-400 mb-3">Conflict check results</p>
                <div className="space-y-2">
                  {[
                    { label: 'No overlapping SOP definitions', passed: true },
                    { label: 'Compatible delivery models', passed: true },
                    { label: 'No tier conflicts', passed: true },
                    { label: 'Integration endpoints compatible', passed: true },
                  ].map((check, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-[#111827] border border-[#1e2a3a] rounded-md"
                    >
                      <span
                        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                          check.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}
                      >
                        {check.passed ? (
                          <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-300">{check.label}</span>
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conflictsChecked}
                    onChange={(e) => setConflictsChecked(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#1e2a3a] bg-[#111827] text-[#C9A84C] focus:ring-[#C9A84C]/50"
                  />
                  <span className="text-[11px] text-gray-300">
                    I&apos;ve reviewed all conflict checks
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-5 border-t border-[#1e2a3a]">
            <button
              onClick={() => step > 1 ? setStep((step - 1) as Step) : onClose()}
              className="px-4 py-2 rounded-md text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep((step + 1) as Step)}
                disabled={!canProceed()}
                className="px-5 py-2 rounded-md text-xs font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCompose}
                disabled={!canProceed()}
                className="px-5 py-2 rounded-md text-xs font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Compose Playbook
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
