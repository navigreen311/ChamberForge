'use client';

import React, { useState } from 'react';
import { useMode } from '@/lib/context/ModeContext';
import ModeToggle from '@/app/components/shared/ModeToggle';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-chamber-900 p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 rounded-full transition-colors duration-200"
        style={{ backgroundColor: checked ? '#1D9E75' : '#4B5563' }}
        aria-label={`Toggle ${label}`}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}

export default function ModeSettingsPage() {
  const { mode, isSimple } = useMode();

  const [readingLevel, setReadingLevel] = useState(isSimple ? 1 : 3);
  const [jargonTooltips, setJargonTooltips] = useState(true);
  const [aiRewrite, setAiRewrite] = useState(true);
  const [simplifiedNav, setSimplifiedNav] = useState(isSimple);

  const readingLabels = ['Basic', 'Easy', 'Moderate', 'Advanced', 'Expert'];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Mode Preferences</h1>
      <p className="text-sm text-gray-400 mb-8">
        Control how ChamberForge communicates with you. Simple Mode translates
        industry jargon into plain language.
      </p>

      {/* Mode toggle */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Display Mode</h2>
        <div className="flex items-center justify-between rounded-lg bg-chamber-900 p-4">
          <div>
            <p className="text-sm font-medium text-white">
              Current mode:{' '}
              <span
                className={
                  isSimple ? 'text-[#1D9E75]' : 'text-[#C9A84C]'
                }
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Switch between expert terminology and plain language.
            </p>
          </div>
          <ModeToggle />
        </div>
      </section>

      {/* Reading level slider */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Reading Level</h2>
        <div className="rounded-lg bg-chamber-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">Level</span>
            <span className="text-sm font-medium text-[#C9A84C]">
              {readingLabels[readingLevel]}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={4}
            value={readingLevel}
            onChange={(e) => setReadingLevel(Number(e.target.value))}
            className="w-full accent-[#C9A84C] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {readingLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature toggles */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Simple Mode Features
        </h2>
        <div className="space-y-3">
          <ToggleRow
            label="Jargon Tooltips"
            description="Show plain-language definitions when you hover over industry terms."
            checked={jargonTooltips}
            onChange={setJargonTooltips}
          />
          <ToggleRow
            label="AI Rewrite"
            description="Automatically rewrite complex text into simpler language."
            checked={aiRewrite}
            onChange={setAiRewrite}
          />
          <ToggleRow
            label="Simplified Navigation"
            description="Show a streamlined menu with fewer options and clearer labels."
            checked={simplifiedNav}
            onChange={setSimplifiedNav}
          />
        </div>
      </section>

      {/* Tips section */}
      <section className="rounded-lg border border-[#1D9E75]/30 bg-[#1D9E75]/10 p-4">
        <h3 className="text-sm font-semibold text-[#1D9E75] mb-2">
          Tips for Simple Mode
        </h3>
        <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
          <li>Hover over dotted-underlined words to see plain definitions.</li>
          <li>Click the purple &quot;Explain this simply&quot; button on any complex section.</li>
          <li>Follow the progress bar to know what step you are on.</li>
          <li>Switch back to Expert mode anytime using the toggle above.</li>
        </ul>
      </section>
    </div>
  );
}
