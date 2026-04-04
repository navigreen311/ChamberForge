'use client';

import { useState } from 'react';

interface ScanConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScanConfigDrawer({
  isOpen,
  onClose,
}: ScanConfigDrawerProps) {
  const [sources, setSources] = useState({
    surveys: true,
    interviews: true,
    marketReports: true,
    regulatory: false,
    socialMedia: false,
    forums: true,
  });
  const [contradictionDetection, setContradictionDetection] = useState(true);
  const [recencyDecay, setRecencyDecay] = useState(true);
  const [scanFrequency, setScanFrequency] = useState('daily');

  const toggleSource = (key: keyof typeof sources) => {
    setSources((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`relative w-8 h-4.5 rounded-full transition-colors ${
        checked ? 'bg-[#C9A84C]' : 'bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  );

  const sourceLabels: Record<string, string> = {
    surveys: 'Surveys',
    interviews: 'Interviews',
    marketReports: 'Market Reports',
    regulatory: 'Regulatory Filings',
    socialMedia: 'Social Media',
    forums: 'Forums & Communities',
  };

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
        className={`fixed top-0 right-0 h-full w-[320px] bg-[#0D1117] border-l border-[#1e2a3a] z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e2a3a]">
            <h2 className="text-sm font-semibold text-white">
              Scan Configuration
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Source Types */}
            <div>
              <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
                Source Types
              </h3>
              <div className="space-y-3">
                {Object.entries(sources).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">
                      {sourceLabels[key]}
                    </span>
                    <Toggle
                      checked={val}
                      onChange={() =>
                        toggleSource(key as keyof typeof sources)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Options */}
            <div>
              <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
                Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    Contradiction Detection
                  </span>
                  <Toggle
                    checked={contradictionDetection}
                    onChange={() =>
                      setContradictionDetection(!contradictionDetection)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Recency Decay</span>
                  <Toggle
                    checked={recencyDecay}
                    onChange={() => setRecencyDecay(!recencyDecay)}
                  />
                </div>
              </div>
            </div>

            {/* Scan Frequency */}
            <div>
              <h3 className="text-[11px] uppercase tracking-wider text-gray-500 mb-3">
                Scan Frequency
              </h3>
              <select
                value={scanFrequency}
                onChange={(e) => setScanFrequency(e.target.value)}
                className="w-full bg-[#111827] border border-[#1e2a3a] rounded-md px-2.5 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-[#C9A84C]"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#1e2a3a]">
            <button className="w-full py-2 bg-[#C9A84C] text-[#0D1117] text-sm font-semibold rounded-md hover:bg-[#d4b65c] transition-colors">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
