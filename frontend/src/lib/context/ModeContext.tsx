'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Mode = 'expert' | 'simple';

interface ModeContextValue {
  mode: Mode;
  toggleMode: () => void;
  isSimple: boolean;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'cf-mode';

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('expert');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'simple' || stored === 'expert') {
      setMode(stored);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode, mounted]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'expert' ? 'simple' : 'expert'));
  }, []);

  const value: ModeContextValue = {
    mode,
    toggleMode,
    isSimple: mode === 'simple',
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return ctx;
}
