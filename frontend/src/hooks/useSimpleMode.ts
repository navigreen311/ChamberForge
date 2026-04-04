'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import React from 'react';

interface SimpleModeContextValue {
  isSimple: boolean;
  toggle: () => void;
}

const SimpleModeContext = createContext<SimpleModeContextValue>({
  isSimple: false,
  toggle: () => {},
});

export function SimpleModeProvider({ children }: { children: ReactNode }) {
  const [isSimple, setIsSimple] = useState(false);
  const toggle = useCallback(() => setIsSimple((v) => !v), []);

  return React.createElement(
    SimpleModeContext.Provider,
    { value: { isSimple, toggle } },
    children,
  );
}

export function useSimpleMode() {
  return useContext(SimpleModeContext);
}
