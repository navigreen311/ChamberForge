'use client';

import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPrompt() {
  const { canInstall, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gold-400/20 bg-chamber-900/80 px-4 py-3 text-sm backdrop-blur">
      <p className="text-slate-300">
        <span className="mr-2 font-semibold text-gold-400">Install ChamberForge</span>
        for offline access and a native app experience.
      </p>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={install}
          className="rounded-md bg-gold-400 px-4 py-1.5 text-sm font-semibold text-chamber-950 transition-opacity hover:opacity-90"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-md px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          aria-label="Dismiss install prompt"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
