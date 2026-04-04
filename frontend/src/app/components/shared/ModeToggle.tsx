'use client';

import React, { useState } from 'react';
import { useMode } from '@/lib/context/ModeContext';

export default function ModeToggle() {
  const { mode, toggleMode, isSimple } = useMode();
  const [toast, setToast] = useState<string | null>(null);

  const handleToggle = () => {
    toggleMode();
    const next = isSimple ? 'Expert' : 'Simple';
    setToast(`Switched to ${next} Mode`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="relative flex items-center gap-3">
      <span
        className={`text-sm font-medium transition-colors ${
          !isSimple ? 'text-[#C9A84C]' : 'text-gray-400'
        }`}
      >
        Expert
      </span>

      <button
        onClick={handleToggle}
        aria-label={`Switch to ${isSimple ? 'expert' : 'simple'} mode`}
        className="relative h-7 w-12 rounded-full transition-colors duration-300"
        style={{ backgroundColor: isSimple ? '#1D9E75' : '#C9A84C' }}
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300"
          style={{
            transform: isSimple ? 'translateX(22px)' : 'translateX(2px)',
          }}
        />
      </button>

      <span
        className={`text-sm font-medium transition-colors ${
          isSimple ? 'text-[#1D9E75]' : 'text-gray-400'
        }`}
      >
        Simple
      </span>

      {toast && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-chamber-800 px-3 py-1 text-xs text-white shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
