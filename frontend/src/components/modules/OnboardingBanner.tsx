'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function OnboardingBanner() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [stepsRemaining, setStepsRemaining] = useState(0);

  useEffect(() => {
    api
      .get('/api/v1/onboarding/status')
      .then(({ data }) => {
        if (data.completed) return;
        const remaining = data.steps.filter(
          (s: { completed: boolean; skipped: boolean }) => !s.completed && !s.skipped,
        ).length;
        if (remaining > 0) {
          setStepsRemaining(remaining);
          setVisible(true);
        }
      })
      .catch(() => {
        // Silently ignore — banner just won't show
      });
  }, []);

  const dismiss = async () => {
    setVisible(false);
    try {
      await api.post('/api/v1/onboarding/dismiss');
    } catch {
      // Best-effort dismiss
    }
  };

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-gold-400/30 bg-gold-400/10 px-5 py-3">
      <p className="text-sm font-medium text-gold-300">
        Complete your setup &mdash; {stepsRemaining} step{stepsRemaining !== 1 ? 's' : ''} left
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/onboarding')}
          className="rounded-lg bg-gold-400 px-4 py-1.5 text-sm font-semibold text-chamber-950 transition hover:bg-gold-300"
        >
          Continue
        </button>
        <button
          onClick={dismiss}
          className="text-sm text-chamber-400 hover:text-chamber-200"
          aria-label="Dismiss onboarding banner"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
