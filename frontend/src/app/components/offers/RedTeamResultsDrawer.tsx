'use client';

import React from 'react';

export interface RedTeamCheck {
  id: string;
  name: string;
  passed: boolean;
  description: string;
  recommendation?: string;
}

export interface RedTeamResults {
  checks: RedTeamCheck[];
}

interface RedTeamResultsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  results: RedTeamResults;
}

export default function RedTeamResultsDrawer({
  isOpen,
  onClose,
  results,
}: RedTeamResultsDrawerProps) {
  const failedCount = results.checks.filter((c) => !c.passed).length;
  const passedCount = results.checks.filter((c) => c.passed).length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[480px] bg-[#0D1117] border-l border-[#1e2a3a]
          z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
          <div>
            <h2 className="text-sm font-semibold text-white">Red Team Results</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {passedCount} passed &middot; {failedCount} failed
            </p>
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

        {/* Checks list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Failed checks first */}
          {results.checks
            .filter((c) => !c.passed)
            .map((check) => (
              <div
                key={check.id}
                className="bg-[#111827] border border-red-500/30 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">{check.name}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{check.description}</p>
                    {check.recommendation && (
                      <div className="mt-2 p-2 bg-red-500/5 rounded border border-red-500/10">
                        <p className="text-[10px] uppercase tracking-wider text-red-400 mb-1">
                          Recommendation
                        </p>
                        <p className="text-[11px] text-gray-300">
                          {check.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* Passed checks */}
          {results.checks
            .filter((c) => c.passed)
            .map((check) => (
              <div
                key={check.id}
                className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium text-gray-300">{check.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{check.description}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        {failedCount > 0 && (
          <div className="p-4 border-t border-[#1e2a3a]">
            <button className="w-full py-2.5 rounded-md text-sm font-medium bg-[#C9A84C] text-black hover:bg-[#C9A84C]/90 transition-colors">
              Resolve All ({failedCount})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
