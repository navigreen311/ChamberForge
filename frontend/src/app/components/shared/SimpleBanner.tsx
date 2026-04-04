'use client';

import { Lightbulb } from 'lucide-react';

export default function SimpleBanner() {
  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-emerald-900/30 border-b border-emerald-700/30">
      <Lightbulb className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <p className="text-xs text-emerald-300">
        <span className="font-semibold">Simple Mode</span> — We&apos;ve simplified everything so you can focus on getting started. Switch to Pro for the full experience.
      </p>
    </div>
  );
}
