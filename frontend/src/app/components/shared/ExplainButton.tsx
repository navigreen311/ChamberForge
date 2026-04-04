'use client';

import React, { useState } from 'react';

interface ExplainButtonProps {
  content: string;
  context?: string;
}

export default function ExplainButton({ content, context }: ExplainButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleClick = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    setExplanation(null);

    // Mock response — simulates a short delay then returns a plain-language explanation
    setTimeout(() => {
      setExplanation(
        `Here's what this means in plain language: ${content.slice(0, 80)}... ` +
          `This is about making things easier to understand for people who are new to premium services.` +
          (context ? ` Context: ${context}.` : '')
      );
      setLoading(false);
    }, 800);
  };

  return (
    <span className="relative inline-block">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-purple-500"
      >
        <span className="text-sm">💡</span> Explain this simply
      </button>

      {open && (
        <span className="absolute top-full left-0 z-50 mt-2 w-72 rounded-lg bg-chamber-800 p-3 text-sm text-white shadow-xl">
          {loading ? (
            <span className="text-gray-400 animate-pulse">Explaining...</span>
          ) : (
            <span>{explanation}</span>
          )}
        </span>
      )}
    </span>
  );
}
