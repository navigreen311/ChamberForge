'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface ReadinessCheckItem {
  id: string;
  label: string;
  passed: boolean;
  description: string;
}

interface FounderReadinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  playbookName: string;
  checks: ReadinessCheckItem[];
  readinessScore: number;
  onActivateAnyway: () => void;
  onCompleteGaps: () => void;
}

interface ReadinessItem {
  id: string;
  label: string;
  description: string;
  howToProve: string;
  timeToResolve: string;
  scoreWeight: number;
  route: string | null;
  routeLabel?: string;
  failed?: boolean;
  passed?: boolean;
  failReason?: string;
}

const readinessItems: ReadinessItem[] = [
  {
    id: 'credentials',
    label: 'Credentials verified',
    description:
      'You have relevant background for this pain category — prior experience, certifications, or a track record clients can verify. For Footprint Reduction: experience in OSINT, privacy law familiarity, or past work with data removal services.',
    howToProve: 'Add credentials to your profile under Settings → Profile → Credentials',
    timeToResolve: 'Already done — just needs to be documented (15 min)',
    scoreWeight: 20,
    route: '/settings/profile',
    routeLabel: 'Go to profile →',
    passed: true,
  },
  {
    id: 'network',
    label: 'Network & partnerships',
    description:
      'You have access to at least one trust channel — a private banker, estate attorney, wealth manager, or family office consultant who can introduce you to UHNW prospects.',
    howToProve:
      'Add your referral partners under Partners → Add Partner. At least 1 active partner required.',
    timeToResolve: '2-4 weeks if building from scratch, or immediate if existing relationships',
    scoreWeight: 20,
    route: '/partners',
    routeLabel: 'Add a partner →',
    passed: true,
  },
  {
    id: 'delivery',
    label: 'Delivery capacity confirmed',
    description:
      'You can deliver this offer at the quality level UHNW clients expect. For Footprint Reduction: you have 8-12 hours/week available and access to the required data removal tools.',
    howToProve: 'Confirm your weekly availability and tool access in the playbook settings.',
    timeToResolve: 'Immediate — just confirm your availability',
    scoreWeight: 20,
    route: null,
    passed: true,
  },
  {
    id: 'compliance',
    label: 'Compliance review',
    description:
      'This playbook has been reviewed against applicable regulations in your jurisdiction. Footprint Reduction involves data handling that may trigger CCPA, GDPR, or state privacy law obligations depending on your client locations.',
    howToProve:
      'Complete the compliance review in Risk Queue. Review the 2 flagged items and confirm your compliance approach.',
    timeToResolve: '1-2 hours to read and confirm. May require a brief legal consultation.',
    scoreWeight: 20,
    failed: true,
    failReason: 'CCPA compliance confirmation not completed for California-based clients',
    route: '/risk-queue',
    routeLabel: 'Complete compliance review →',
  },
  {
    id: 'evidence',
    label: 'Evidence review completed',
    description:
      'You have reviewed the evidence chain for this playbook and understand why this problem exists, what the research shows, and how to discuss it credibly with prospects.',
    howToProve:
      'View all evidence citations in the playbook detail panel — marked complete when all are viewed.',
    timeToResolve: '20-30 minutes to read through all citations',
    scoreWeight: 20,
    route: null,
    passed: true,
  },
];

export default function FounderReadinessModal({
  isOpen,
  onClose,
  playbookName,
  readinessScore,
  onActivateAnyway,
  onCompleteGaps,
}: FounderReadinessModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const hasFailedItems = readinessItems.some((i) => i.failed);
  const score = readinessScore;

  const handleActivateAnyway = () => {
    if (hasFailedItems) {
      const confirmed = window.confirm(
        'Activating with open compliance gaps may expose you to regulatory risk. ' +
          'Anthropic recommends completing all readiness items first. Continue anyway?',
      );
      if (!confirmed) return;
    }
    onActivateAnyway();
  };

  const handleCompleteGaps = () => {
    const firstFailed = readinessItems.find((i) => i.failed);
    if (firstFailed?.route) {
      router.push(firstFailed.route);
    } else {
      onCompleteGaps();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b border-[#1e2a3a] sticky top-0 bg-[#0D1117] z-10">
            <div>
              <h2 className="text-sm font-semibold text-white">Founder Readiness</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{playbookName}</p>
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

          <div className="p-5">
            <div className="mt-1 mb-4">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#4a5568]">Readiness score</span>
                <span
                  className={`font-semibold ${
                    score >= 80
                      ? 'text-[#C9A84C]'
                      : score >= 60
                        ? 'text-[#BA7517]'
                        : 'text-[#E24B4A]'
                  }`}
                >
                  {score}/100
                </span>
              </div>
              <div className="h-2 bg-[#1e2a3a] rounded-full">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${score}%`,
                    background:
                      score >= 80 ? '#C9A84C' : score >= 60 ? '#BA7517' : '#E24B4A',
                  }}
                />
              </div>
              <div className="text-[9px] text-[#4a5568] mt-1">
                {score >= 80
                  ? 'Good to activate — one gap remaining'
                  : score >= 60
                    ? 'Resolve 2+ gaps before activating for best results'
                    : 'Multiple gaps detected — complete readiness items first'}
              </div>
            </div>

            <div>
              {readinessItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg p-4 mb-3 border ${
                    item.failed
                      ? 'bg-[#1f0d0d] border-[#E24B4A]/30'
                      : item.passed
                        ? 'bg-[#0F2E1A] border-[#1D9E75]/30'
                        : 'bg-[#111827] border-[#1e2a3a]'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        item.failed
                          ? 'bg-[#E24B4A] text-white'
                          : item.passed
                            ? 'bg-[#1D9E75] text-white'
                            : 'bg-[#1e2a3a] text-[#4a5568]'
                      }`}
                    >
                      {item.failed ? '✗' : item.passed ? '✓' : '○'}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-[12px] font-semibold mb-1 ${
                          item.failed
                            ? 'text-[#E24B4A]'
                            : item.passed
                              ? 'text-[#1D9E75]'
                              : 'text-[#e2e8f0]'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#8892a4] leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                    <div className="text-[9px] text-[#4a5568] flex-shrink-0">
                      {item.scoreWeight}pts
                    </div>
                  </div>

                  {item.failed && item.failReason && (
                    <div className="bg-[#2a0a0a] border border-[#E24B4A]/20 rounded px-3 py-2 mb-2">
                      <div className="text-[9px] font-semibold text-[#E24B4A] mb-0.5">What failed:</div>
                      <div className="text-[10px] text-[#F09595]">{item.failReason}</div>
                    </div>
                  )}

                  {(item.failed || !item.passed) && (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[9px] font-semibold text-[#4a5568] mb-0.5">
                          How to resolve:
                        </div>
                        <div className="text-[9px] text-[#8892a4]">{item.howToProve}</div>
                        <div className="text-[9px] text-[#4a5568] mt-1">⏱ {item.timeToResolve}</div>
                      </div>
                      {item.route && (
                        <a
                          href={item.route}
                          className="flex-shrink-0 text-[9px] px-3 py-1.5 border border-[#C9A84C]/40 text-[#C9A84C] rounded-lg hover:bg-[#1B2340] transition whitespace-nowrap"
                        >
                          {item.routeLabel}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-5 border-t border-[#1e2a3a] sticky bottom-0 bg-[#0D1117]">
            <button
              onClick={handleActivateAnyway}
              className="flex-1 py-2.5 border border-[#2a3a4a] text-[#8892a4] rounded-lg text-[12px] hover:border-[#E24B4A] hover:text-[#E24B4A] transition"
            >
              Activate anyway (not recommended)
            </button>
            <button
              onClick={handleCompleteGaps}
              className="flex-1 py-2.5 bg-[#C9A84C] text-[#0D1117] rounded-lg text-[12px] font-semibold"
            >
              Complete gaps first →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
