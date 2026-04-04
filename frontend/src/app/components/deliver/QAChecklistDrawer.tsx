'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface QADeliverable {
  id: string;
  name: string;
  type: string;
}

interface QAChecklistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deliverable: QADeliverable | null;
}

const QA_CHECKS = [
  { id: 'accuracy', label: 'Data accuracy verified' },
  { id: 'formatting', label: 'Formatting & branding compliant' },
  { id: 'compliance', label: 'Regulatory compliance checked' },
  { id: 'review', label: 'Peer review completed' },
];

export default function QAChecklistDrawer({ isOpen, onClose, deliverable }: QAChecklistDrawerProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = QA_CHECKS.every((c) => checks[c.id]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-[480px] bg-[#111827] border-l border-[#1e2a3a] z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#1e2a3a]">
          <div>
            <h2 className="text-lg font-semibold text-white">QA Checklist</h2>
            {deliverable && (
              <p className="text-xs text-gray-500 mt-0.5">{deliverable.name}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {QA_CHECKS.map((check) => (
            <label
              key={check.id}
              className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                checks[check.id]
                  ? 'bg-emerald-900/10 border-emerald-800'
                  : 'bg-[#0d1117] border-[#1e2a3a] hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={checks[check.id] || false}
                onChange={() => toggleCheck(check.id)}
                className="rounded bg-[#1a2332] border-gray-600 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <span className={`text-sm ${checks[check.id] ? 'text-emerald-400' : 'text-gray-300'}`}>
                {check.label}
              </span>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1e2a3a]">
          <button
            disabled={!allChecked}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              allChecked
                ? 'bg-[#C9A84C] text-black hover:bg-[#d4b65e]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            Mark Complete
          </button>
        </div>
      </div>
    </>
  );
}
