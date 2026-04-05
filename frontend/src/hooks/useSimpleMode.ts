'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cf-mode';

export function useSimpleMode() {
  const [isSimple, setIsSimple] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'simple') setIsSimple(true);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setIsSimple((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? 'simple' : 'expert'); } catch {}
      return next;
    });
  }, []);

  return { isSimple: mounted ? isSimple : false, toggle, mounted };
}
