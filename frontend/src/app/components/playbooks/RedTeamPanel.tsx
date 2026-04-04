'use client';

import React from 'react';

export interface RedTeamCheck {
  id: string;
  name: string;
  passed: boolean;
  description: string;
  recommendation?: string;
}

interface RedTeamPanelProps {
  checks: RedTeamCheck[];
  playbookName?: string;
}

export default function RedTeamPanel({ checks, playbookName }: RedTeamPanelProps) {
  const passedCount = checks.filter((c) => c.passed).length;
  const failedCount = checks.filter((c) => !c.passed).length;

  return (
    <div className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
        <div>
          <h3 className="text-sm font-semibold text-white">Red-Team Results</h3>
          {playbookName && (
            <p className="text-[10px] text-gray-500 mt-0.5">{playbookName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-gray-400">{passedCount} passed</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] text-gray-400">{failedCount} failed</span>
          </span>
        </div>
      </div>

      {/* Checks */}
      <div className="p-4 space-y-2.5">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`p-3 rounded-lg border ${
              check.passed
                ? 'bg-[#111827] border-[#1e2a3a]'
                : 'bg-red-500/5 border-red-500/20'
            }`}
          >
            <div className="flex items-start gap-2.5">
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
              <div className="flex-1">
                <p className={`text-xs font-medium ${check.passed ? 'text-gray-300' : 'text-white'}`}>
                  {check.name}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{check.description}</p>
                {check.recommendation && !check.passed && (
                  <div className="mt-2 p-2 bg-red-500/5 rounded border border-red-500/10">
                    <p className="text-[10px] uppercase tracking-wider text-red-400 mb-0.5">
                      Recommendation
                    </p>
                    <p className="text-[11px] text-gray-300">{check.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
