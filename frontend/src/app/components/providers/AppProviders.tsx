'use client';

import React from 'react';

import SessionProvider from '@/app/components/providers/SessionProvider'
import { ModeProvider } from '@/lib/context/ModeContext';

/**
 * Client-side provider shell for the whole app.
 *
 * P-00 created this for two reasons. First, ModeProvider was defined but
 * mounted nowhere, so every page calling useMode() threw
 * "useMode must be used within a ModeProvider" - which is what broke the
 * production build at /settings/mode.
 *
 * Second, it gives the parallel build a seam. The root layout is a server
 * component and is frozen by P-00; any package that needs to add a client
 * provider (P-11's SessionProvider, for instance) nests it HERE rather than
 * opening layout.tsx, so two packages never contend for the same file.
 *
 * Add providers outermost-first.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  // P-11 nests SessionProvider here rather than in app/layout.tsx, which
  // P-00 froze. Session is outermost: ModeProvider reads the operator's saved
  // mode, so it needs the session already resolved above it.
  return (
    <SessionProvider>
      <ModeProvider>{children}</ModeProvider>
    </SessionProvider>
  );
}
