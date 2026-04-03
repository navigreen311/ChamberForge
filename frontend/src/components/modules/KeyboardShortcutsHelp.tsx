'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const sections: { title: string; shortcuts: ShortcutEntry[] }[] = [
  {
    title: 'Global',
    shortcuts: [
      { keys: ['Cmd', 'K'], description: 'Open search' },
      { keys: ['Cmd', 'Shift', 'D'], description: 'Go to Dashboard' },
      { keys: ['Shift', '?'], description: 'Show this help' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['Cmd', 'Shift', 'P'], description: 'Go to Problems' },
      { keys: ['Cmd', 'Shift', 'O'], description: 'Go to Offers' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['Cmd', 'N'], description: 'New Problem' },
      { keys: ['Cmd', 'S'], description: 'Save' },
      { keys: ['Esc'], description: 'Close modal / panel' },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded border border-chamber-600 bg-chamber-800 px-1.5 py-0.5 text-xs font-mono text-chamber-200">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-xl bg-chamber-900 shadow-2xl border border-chamber-700 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chamber-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-chamber-400 hover:bg-chamber-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-chamber-400 mb-3">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm text-chamber-200">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-chamber-500 text-xs">+</span>}
                          <Kbd>{key}</Kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-chamber-800 px-6 py-3">
          <p className="text-xs text-chamber-500 text-center">
            On Windows/Linux, use <Kbd>Ctrl</Kbd> instead of <Kbd>Cmd</Kbd>
          </p>
        </div>
      </div>
    </div>
  );
}
