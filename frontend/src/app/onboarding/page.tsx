'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

/* ── Step definitions ─────────────────────────────────────────────────────── */

const STEPS = [
  {
    id: 1,
    title: 'Welcome to ChamberForge',
    description: 'Confirm your name and select your primary role so we can personalize your experience.',
    fields: ['name', 'role'],
  },
  {
    id: 2,
    title: 'Discover Your First Problem',
    description: 'Every great offer starts with a real problem. We\'ve pre-filled an example — edit it or create your own.',
    fields: ['problem'],
  },
  {
    id: 3,
    title: 'Activate a Playbook',
    description: 'Playbooks are step-by-step frameworks for winning in the HNW market. Pick one to get started.',
    fields: ['playbook'],
  },
  {
    id: 4,
    title: 'Create Your First Offer',
    description: 'Package your expertise into a compelling offer. We\'ll walk you through the basics.',
    fields: ['offer'],
  },
  {
    id: 5,
    title: 'Invite Your Team',
    description: 'ChamberForge is better together. Invite a colleague to collaborate.',
    fields: ['email'],
  },
];

const ROLE_OPTIONS = ['Advisor', 'Consultant', 'Founder', 'Operator', 'Executive'];

const SAMPLE_PLAYBOOKS = [
  { id: 'pb-1', name: 'Trust-First Positioning', description: 'Build authority before selling.' },
  { id: 'pb-2', name: 'Wedge Entry Strategy', description: 'Land a small win to prove value.' },
  { id: 'pb-3', name: 'Referral Flywheel', description: 'Turn clients into advocates.' },
];

/* ── OnboardingPage ───────────────────────────────────────────────────────── */

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [problemTitle, setProblemTitle] = useState('My clients struggle to articulate their real pain');
  const [selectedPlaybook, setSelectedPlaybook] = useState('');
  const [offerTitle, setOfferTitle] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  /* Fetch onboarding status on mount */
  useEffect(() => {
    api
      .get('/api/v1/onboarding/status')
      .then(({ data }) => {
        if (data.completed) {
          router.replace('/dashboard');
          return;
        }
        setCurrentStep(data.current_step);
      })
      .catch(() => {
        // First visit — start at step 1
      })
      .finally(() => setLoading(false));
  }, [router]);

  /* Actions */
  const completeStep = useCallback(
    async (stepId: number) => {
      setSubmitting(true);
      try {
        const { data } = await api.post(`/api/v1/onboarding/complete/${stepId}`);
        if (data.completed) {
          setShowConfetti(true);
          setTimeout(() => router.replace('/dashboard'), 2500);
        } else {
          setCurrentStep(data.current_step);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [router],
  );

  const skipStep = useCallback(
    async (stepId: number) => {
      setSubmitting(true);
      try {
        const { data } = await api.post(`/api/v1/onboarding/skip/${stepId}`);
        if (data.completed) {
          setShowConfetti(true);
          setTimeout(() => router.replace('/dashboard'), 2500);
        } else {
          setCurrentStep(data.current_step);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [router],
  );

  /* ── Render ─────────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-chamber-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  const step = STEPS[currentStep - 1];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-chamber-950 px-4">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-bounce text-6xl" aria-hidden>
            🎉
          </div>
          <p className="absolute mt-24 text-xl font-semibold text-gold-400">
            You&apos;re all set! Redirecting to your dashboard...
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8 flex w-full max-w-xl items-center gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s.id <= currentStep ? 'bg-gold-400' : 'bg-chamber-700'
            }`}
          />
        ))}
      </div>

      <p className="mb-2 text-sm text-chamber-400">
        Step {currentStep} of {STEPS.length}
      </p>

      {/* Card */}
      <div className="w-full max-w-xl rounded-2xl border border-chamber-800 bg-chamber-900 p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-white">{step.title}</h1>
        <p className="mb-6 text-chamber-300">{step.description}</p>

        {/* Step-specific content */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-chamber-200">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white placeholder-chamber-500 focus:border-gold-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-chamber-200">Primary Role</label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      role === r
                        ? 'bg-gold-400 text-chamber-950'
                        : 'border border-chamber-600 text-chamber-300 hover:border-gold-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-chamber-200">Problem Statement</label>
            <textarea
              value={problemTitle}
              onChange={(e) => setProblemTitle(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white placeholder-chamber-500 focus:border-gold-400 focus:outline-none"
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-3">
            {SAMPLE_PLAYBOOKS.map((pb) => (
              <button
                key={pb.id}
                onClick={() => setSelectedPlaybook(pb.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedPlaybook === pb.id
                    ? 'border-gold-400 bg-chamber-800'
                    : 'border-chamber-700 bg-chamber-850 hover:border-chamber-500'
                }`}
              >
                <p className="font-semibold text-white">{pb.name}</p>
                <p className="text-sm text-chamber-400">{pb.description}</p>
              </button>
            ))}
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-chamber-200">Offer Title</label>
            <input
              type="text"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="e.g. 90-Day Strategic Advisory Sprint"
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white placeholder-chamber-500 focus:border-gold-400 focus:outline-none"
            />
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-chamber-200">Team Member Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2 text-white placeholder-chamber-500 focus:border-gold-400 focus:outline-none"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => skipStep(currentStep)}
            disabled={submitting}
            className="text-sm text-chamber-400 hover:text-chamber-200 disabled:opacity-50"
          >
            Skip this step
          </button>
          <button
            onClick={() => completeStep(currentStep)}
            disabled={submitting}
            className="rounded-lg bg-gold-400 px-6 py-2 font-semibold text-chamber-950 transition hover:bg-gold-300 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : currentStep === STEPS.length ? 'Finish Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
