'use client';

import React from 'react';

interface SimpleProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  'Find a problem',
  'Pick your best one',
  'Build your service',
  'Land your first client',
];

export default function SimpleProgressBar({ currentStep }: SimpleProgressBarProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {STEPS.map((label, idx) => {
          const step = idx + 1;
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;

          let circleColor = 'bg-gray-600 text-gray-400'; // todo
          if (isDone) circleColor = 'bg-[#1D9E75] text-white';
          if (isCurrent) circleColor = 'bg-[#C9A84C] text-white';

          let lineColor = 'bg-gray-600';
          if (step < currentStep) lineColor = 'bg-[#1D9E75]';

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${circleColor}`}
                >
                  {isDone ? '✓' : step}
                </div>
                <span
                  className={`text-xs text-center max-w-[100px] leading-tight ${
                    isCurrent
                      ? 'text-[#C9A84C] font-semibold'
                      : isDone
                        ? 'text-[#1D9E75]'
                        : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>

              {step < STEPS.length && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded transition-colors ${lineColor}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
