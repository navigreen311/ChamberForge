'use client';

import React, { useState, useRef } from 'react';
import { JARGON } from '@/lib/jargon';

interface JargonTooltipProps {
  term: string;
  children: React.ReactNode;
  /** Render the trigger without the dotted-underline affordance. */
  bare?: boolean;
}

export default function JargonTooltip({ term, children, bare = false }: JargonTooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const entry = JARGON[term];

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 150);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        className={
          bare
            ? "cursor-help"
            : "cursor-help border-b border-dotted border-[#C9A84C]"
        }
      >
        {children}
      </span>

      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg bg-chamber-800 p-3 text-sm text-white shadow-xl"
        >
          <strong className="block text-[#C9A84C] mb-1">{term}</strong>
          <span>{entry?.plain ?? `No definition found for "${term}".`}</span>
          {entry?.example && (
            <span className="mt-1 block text-xs text-gray-400 italic">
              e.g. {entry.example}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
