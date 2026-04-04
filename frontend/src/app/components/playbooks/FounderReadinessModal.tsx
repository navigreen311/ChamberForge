'use client';

import React from 'react';

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

export default function FounderReadinessModal({
  isOpen,
  onClose,
  playbookName,
  checks,
  readinessScore,
  onActivateAnyway,
  onCompleteGaps,
}: FounderReadinessModalProps) {
  if (!isOpen) return null;

  const passedCount = checks.filter((c) => c.passed).length;
  const failedCount = checks.filter((c) => !c.passed).length;

  // Gauge calculation
  const gaugeAngle = (readinessScore / 100) * 180;
  const gaugeColor =
    readinessScore >= 80
      ? '#10b981'
      : readinessScore >= 50
        ? '#f59e0b'
        : '#ef4444';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#1e2a3a]">
            <div>
              <h2 className="text-sm font-semibold text-white">Founder Readiness</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">{playbookName}</p>
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

          <div className="p-5 space-y-5">
            {/* Readiness Score Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-16 overflow-hidden">
                <svg viewBox="0 0 120 60" className="w-full h-full">
                  {/* Background arc */}
                  <path
                    d="M10 55 A50 50 0 0 1 110 55"
                    fill="none"
                    stroke="#1e2a3a"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Value arc */}
                  <path
                    d="M10 55 A50 50 0 0 1 110 55"
                    fill="none"
                    stroke={gaugeColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(gaugeAngle / 180) * 157} 157`}
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white -mt-2">{readinessScore}%</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                {passedCount} passed &middot; {failedCount} gaps
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              {checks.map((check) => (
                <div
                  key={check.id}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border ${
                    check.passed
                      ? 'bg-[#111827] border-[#1e2a3a]'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
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
                  <div>
                    <p className={`text-xs font-medium ${check.passed ? 'text-gray-300' : 'text-white'}`}>
                      {check.label}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{check.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 p-5 border-t border-[#1e2a3a]">
            <button
              onClick={onCompleteGaps}
              className="flex-1 py-2.5 rounded-md text-xs font-medium border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-colors"
            >
              Complete Gaps
            </button>
            <button
              onClick={onActivateAnyway}
              className="flex-1 py-2.5 rounded-md text-xs font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors"
            >
              Activate Anyway
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
