'use client';

import React from 'react';
import { useMode } from '@/lib/context/ModeContext';

export default function SimpleBanner() {
  const { isSimple, toggleMode } = useMode();

  if (!isSimple) return null;

  return (
    <div className="flex w-full items-center justify-between bg-[#1D9E75] px-4 py-2 text-sm text-white">
      <span>
        <strong>Simple Mode is on</strong> &mdash; everything is explained in
        plain language.
      </span>

      <div className="flex items-center gap-4">
        <a
          href="/settings/mode"
          className="underline underline-offset-2 hover:text-white/80 transition-colors"
        >
          Tips
        </a>
        <button
          onClick={toggleMode}
          className="underline underline-offset-2 hover:text-white/80 transition-colors"
        >
          I&apos;m ready for more
        </button>
      </div>
    </div>
  );
}
