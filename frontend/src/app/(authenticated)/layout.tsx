'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useKeyboardShortcuts, SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import AppShell from '@/components/layout/AppShell';
import OnboardingBanner from '@/components/modules/OnboardingBanner';
import GlobalSearch from '@/components/modules/GlobalSearch';
import KeyboardShortcutsHelp from '@/components/modules/KeyboardShortcutsHelp';
import InstallPrompt from '@/components/modules/InstallPrompt';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = encodeURIComponent(window.location.pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isLoading, isAuthenticated, router]);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleHelp = useCallback(() => setHelpOpen((h) => !h), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);
  const goToDashboard = useCallback(() => router.push('/dashboard'), [router]);
  const goToProblems = useCallback(() => router.push('/problems'), [router]);
  const goToOffers = useCallback(() => router.push('/offers'), [router]);
  const newProblem = useCallback(() => router.push('/problems/new'), [router]);
  const closeAll = useCallback(() => {
    setSearchOpen(false);
    setHelpOpen(false);
  }, []);

  const shortcuts = useMemo(
    () => [
      { ...SHORTCUTS.SEARCH, handler: openSearch },
      { ...SHORTCUTS.HELP, handler: toggleHelp },
      { ...SHORTCUTS.DASHBOARD, handler: goToDashboard },
      { ...SHORTCUTS.PROBLEMS, handler: goToProblems },
      { ...SHORTCUTS.NEW_OFFER, handler: goToOffers },
      { ...SHORTCUTS.NEW_PROBLEM, handler: newProblem },
      { ...SHORTCUTS.ESCAPE, handler: closeAll },
    ],
    [openSearch, toggleHelp, goToDashboard, goToProblems, goToOffers, newProblem, closeAll],
  );

  useKeyboardShortcuts(shortcuts);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-chamber-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell>
      <InstallPrompt />
      <OnboardingBanner />
      {children}
      <GlobalSearch open={searchOpen} onClose={closeSearch} />
      <KeyboardShortcutsHelp isOpen={helpOpen} onClose={closeHelp} />
    </AppShell>
  );
}
