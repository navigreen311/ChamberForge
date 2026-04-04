'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/* ── Inline Data ─────────────────────────────────────────────────────────── */

const GEO_OPTIONS = [
  'North America', 'Europe', 'Middle East', 'Asia-Pacific',
  'Latin America', 'Africa', 'Global',
];

const MARKET_OPTIONS = ['UHNW', 'HNW', 'Both'] as const;

const SOURCE_LIST = [
  { id: 'linkedin', label: 'LinkedIn Premium', icon: '🔗' },
  { id: 'crunchbase', label: 'Crunchbase', icon: '📊' },
  { id: 'pitchbook', label: 'PitchBook', icon: '📈' },
  { id: 'sec', label: 'SEC Filings', icon: '📄' },
  { id: 'news', label: 'News & PR Wires', icon: '📰' },
  { id: 'wealth-x', label: 'Wealth-X', icon: '💎' },
  { id: 'family-office', label: 'Family Office DB', icon: '🏛' },
  { id: 'realtime-events', label: 'Real-Time Events', icon: '📅' },
  { id: 'custom-crm', label: 'Your CRM', icon: '🗂' },
];

const SAMPLE_PROBLEMS = [
  {
    title: 'Succession Planning Gap',
    severity: 'High',
    source: 'SEC Filings + News',
    description: 'CEO of $400M family enterprise nearing retirement with no public succession plan.',
  },
  {
    title: 'Liquidity Event Incoming',
    severity: 'Critical',
    source: 'Crunchbase + PitchBook',
    description: 'Series D startup valued at $1.2B preparing for IPO — founder will need wealth structuring.',
  },
  {
    title: 'Cross-Border Tax Exposure',
    severity: 'Medium',
    source: 'LinkedIn + Wealth-X',
    description: 'UHNW individual relocated from UK to Dubai — likely unresolved tax optimization.',
  },
];

const READINESS_ITEMS = [
  { id: 'credentials', label: 'Professional credentials verified', detail: 'CFA, CFP, JD, or equivalent' },
  { id: 'network', label: 'Existing HNW/UHNW network', detail: '10+ qualified contacts' },
  { id: 'delivery', label: 'Service delivery capability', detail: 'Can fulfill within 30 days' },
  { id: 'compliance', label: 'Compliance & licensing current', detail: 'All regulatory requirements met' },
  { id: 'runway', label: 'Financial runway secured', detail: '6+ months operating capital' },
  { id: 'time', label: 'Time commitment confirmed', detail: '15+ hours/week dedicated' },
];

const PLAYBOOK_LIST = [
  {
    id: 'pb-trust',
    name: 'Trust-First Authority Builder',
    match: '96%',
    description: 'Build deep credibility with UHNW prospects through thought leadership, warm introductions, and curated events before ever making an offer.',
    tags: ['Relationship-Led', 'Long Cycle', 'High LTV'],
  },
  {
    id: 'pb-wedge',
    name: 'Wedge Entry Accelerator',
    match: '91%',
    description: 'Land a small, high-value diagnostic engagement that proves ROI and naturally expands into a full advisory relationship.',
    tags: ['Quick Win', 'Proof-of-Value', 'Expansion'],
  },
  {
    id: 'pb-referral',
    name: 'Referral Flywheel Engine',
    match: '87%',
    description: 'Turn every satisfied client into 2-3 qualified referrals through systematic follow-up, incentive structures, and co-created content.',
    tags: ['Scalable', 'Network Effect', 'Low CAC'],
  },
];

const SETUP_CHECKLIST = [
  'Profile & market preferences configured',
  'Data sources connected (AI scanning enabled)',
  'First AI scan completed — 3 problems identified',
  'Founder readiness assessment scored',
  'Playbook selected & activated',
  'Dashboard personalized to your focus',
];

const WHY_NOTES: Record<number, string> = {
  1: 'We tailor every insight, playbook, and recommendation to your specific market and experience level.',
  2: 'The more sources connected, the more hidden problems our AI can surface for you to solve.',
  3: 'Seeing real problems immediately proves the value of the platform and gives you something to act on today.',
  4: 'Honest self-assessment ensures we recommend playbooks and timelines that actually fit your situation.',
  5: 'The right playbook matched to your profile can cut your time-to-first-client by 60%.',
  6: 'Everything is set up. Your personalized dashboard is ready to drive results from day one.',
};

/* ── Component ───────────────────────────────────────────────────────────── */

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 — Profile
  const [profile, setProfile] = useState({
    name: '',
    company: '',
    yearsExperience: '',
    market: '' as string,
    geoFocus: '',
    currentRevenue: '',
  });

  // Step 2 — Sources
  const [sources, setSources] = useState<Record<string, boolean>>(
    Object.fromEntries(SOURCE_LIST.map((s) => [s.id, false])),
  );

  // Step 3 — AI Scan
  const [scanRunning, setScanRunning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  // Step 4 — Readiness
  const [readiness, setReadiness] = useState<Record<string, boolean>>(
    Object.fromEntries(READINESS_ITEMS.map((r) => [r.id, false])),
  );

  // Step 5 — Playbook
  const [selectedPlaybook, setSelectedPlaybook] = useState('');

  /* ── Helpers ────────────────────────────────────────────────────────────── */

  const connectedCount = Object.values(sources).filter(Boolean).length;

  const readinessScore = (() => {
    const checked = Object.values(readiness).filter(Boolean).length;
    const base = Math.round((checked / READINESS_ITEMS.length) * 80);
    return Math.min(base + 20, 100); // baseline 20 for signing up
  })();

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1: return profile.name.trim().length > 0;
      case 2: return true;
      case 3: return scanComplete;
      case 4: return true;
      case 5: return selectedPlaybook !== '';
      case 6: return true;
      default: return false;
    }
  }, [currentStep, profile.name, scanComplete, selectedPlaybook]);

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep((s) => s + 1);
    else router.push('/dashboard');
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSkip = () => {
    if (currentStep < 6) setCurrentStep((s) => s + 1);
  };

  const runAiScan = () => {
    setScanRunning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setScanRunning(false);
          setScanComplete(true);
          return 100;
        }
        return p + 2;
      });
    }, 60);
  };

  const updateProfile = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSource = (id: string) => {
    setSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReadiness = (id: string) => {
    setReadiness((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* ── Render Steps ──────────────────────────────────────────────────────── */

  const renderStep = () => {
    switch (currentStep) {
      /* ── Step 1: Welcome ─────────────────────────────────────────────── */
      case 1:
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">Welcome to ChamberForge</h2>
            <p className="text-[#8B949E]">Tell us about yourself so we can personalize your experience.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#C9D1D9]">Full Name *</label>
                <input type="text" value={profile.name} onChange={(e) => updateProfile('name', e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-2.5 text-white placeholder-[#484F58] focus:border-[#D4A843] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#C9D1D9]">Company</label>
                <input type="text" value={profile.company} onChange={(e) => updateProfile('company', e.target.value)}
                  placeholder="Acme Wealth Advisors"
                  className="w-full rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-2.5 text-white placeholder-[#484F58] focus:border-[#D4A843] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#C9D1D9]">Years of Experience</label>
                <input type="number" value={profile.yearsExperience} onChange={(e) => updateProfile('yearsExperience', e.target.value)}
                  placeholder="10"
                  className="w-full rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-2.5 text-white placeholder-[#484F58] focus:border-[#D4A843] focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#C9D1D9]">Target Market</label>
                <div className="flex gap-2">
                  {MARKET_OPTIONS.map((m) => (
                    <button key={m} onClick={() => updateProfile('market', m)}
                      className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                        profile.market === m
                          ? 'border-[#D4A843] bg-[#D4A843]/10 text-[#D4A843]'
                          : 'border-[#30363D] text-[#8B949E] hover:border-[#484F58]'
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#C9D1D9]">Geographic Focus</label>
                <select value={profile.geoFocus} onChange={(e) => updateProfile('geoFocus', e.target.value)}
                  className="w-full rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-2.5 text-white focus:border-[#D4A843] focus:outline-none">
                  <option value="">Select region...</option>
                  {GEO_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#C9D1D9]">Current Annual Revenue</label>
                <input type="text" value={profile.currentRevenue} onChange={(e) => updateProfile('currentRevenue', e.target.value)}
                  placeholder="$500K"
                  className="w-full rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-2.5 text-white placeholder-[#484F58] focus:border-[#D4A843] focus:outline-none" />
              </div>
            </div>
          </div>
        );

      /* ── Step 2: Connect Sources ─────────────────────────────────────── */
      case 2:
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">Connect Your Data Sources</h2>
            <p className="text-[#8B949E]">Toggle on the sources you have access to. Our AI will scan them for hidden problems.</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SOURCE_LIST.map((src) => (
                <button key={src.id} onClick={() => toggleSource(src.id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                    sources[src.id]
                      ? 'border-[#D4A843] bg-[#D4A843]/10'
                      : 'border-[#30363D] bg-[#161B22] hover:border-[#484F58]'
                  }`}>
                  <span className="text-2xl">{src.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{src.label}</p>
                    <p className={`text-xs ${sources[src.id] ? 'text-green-400' : 'text-[#484F58]'}`}>
                      {sources[src.id] ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  <div className={`h-3 w-3 rounded-full ${sources[src.id] ? 'bg-green-400' : 'bg-[#30363D]'}`} />
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-4 text-center">
              <p className="text-lg font-semibold text-[#D4A843]">
                Estimated: {connectedCount > 0 ? `${connectedCount * 5}+` : '40+'} problems findable
              </p>
              <p className="text-sm text-[#8B949E]">{connectedCount} of {SOURCE_LIST.length} sources connected</p>
            </div>
          </div>
        );

      /* ── Step 3: First AI Scan ───────────────────────────────────────── */
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Run Your First AI Scan</h2>
            <p className="text-[#8B949E]">Our AI will analyze connected sources and surface real problems you can solve.</p>

            {!scanComplete && !scanRunning && (
              <div className="flex flex-col items-center py-8">
                <button onClick={runAiScan}
                  className="rounded-xl bg-[#D4A843] px-10 py-4 text-lg font-bold text-[#0D1117] shadow-lg shadow-[#D4A843]/20 transition hover:bg-[#E0B854] hover:shadow-[#D4A843]/30">
                  Run AI Scan
                </button>
                <p className="mt-3 text-sm text-[#484F58]">Takes about 30 seconds</p>
              </div>
            )}

            {scanRunning && (
              <div className="space-y-3 py-6">
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#30363D]">
                  <div className="h-full rounded-full bg-[#D4A843] transition-all duration-100"
                    style={{ width: `${scanProgress}%` }} />
                </div>
                <p className="text-center text-sm text-[#8B949E]">
                  Scanning {scanProgress < 30 ? 'SEC filings...' : scanProgress < 60 ? 'news sources...' : scanProgress < 85 ? 'wealth databases...' : 'finalizing results...'}
                </p>
              </div>
            )}

            {scanComplete && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-green-400">Scan complete — 3 problems found</p>
                {SAMPLE_PROBLEMS.map((problem, i) => (
                  <div key={i} className="rounded-xl border border-[#30363D] bg-[#161B22] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-white">{problem.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        problem.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        problem.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>{problem.severity}</span>
                    </div>
                    <p className="mb-1 text-sm text-[#C9D1D9]">{problem.description}</p>
                    <p className="text-xs text-[#484F58]">Source: {problem.source}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ── Step 4: Founder Readiness ───────────────────────────────────── */
      case 4:
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">Founder Readiness Check</h2>
            <p className="text-[#8B949E]">Honestly assess where you stand. This helps us match you with the right playbook and timeline.</p>

            <div className="space-y-3">
              {READINESS_ITEMS.map((item) => (
                <button key={item.id} onClick={() => toggleReadiness(item.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    readiness[item.id]
                      ? 'border-[#D4A843] bg-[#D4A843]/10'
                      : 'border-[#30363D] bg-[#161B22] hover:border-[#484F58]'
                  }`}>
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm ${
                    readiness[item.id]
                      ? 'border-[#D4A843] bg-[#D4A843] text-[#0D1117]'
                      : 'border-[#484F58] text-transparent'
                  }`}>
                    {readiness[item.id] && '✓'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-xs text-[#484F58]">{item.detail}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 text-center">
              <p className="text-sm text-[#8B949E]">Your Readiness Score</p>
              <p className="mt-1 text-4xl font-bold text-[#D4A843]">{readinessScore}<span className="text-lg text-[#484F58]"> / 100</span></p>
              <div className="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-[#30363D]">
                <div className="h-full rounded-full bg-[#D4A843] transition-all" style={{ width: `${readinessScore}%` }} />
              </div>
            </div>
          </div>
        );

      /* ── Step 5: Select Playbook ─────────────────────────────────────── */
      case 5:
        return (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-white">Select Your Playbook</h2>
            <p className="text-[#8B949E]">Based on your profile and readiness, here are our top 3 recommended playbooks.</p>

            <div className="space-y-3">
              {PLAYBOOK_LIST.map((pb) => (
                <button key={pb.id} onClick={() => setSelectedPlaybook(pb.id)}
                  className={`w-full rounded-xl border p-5 text-left transition ${
                    selectedPlaybook === pb.id
                      ? 'border-[#D4A843] bg-[#D4A843]/10'
                      : 'border-[#30363D] bg-[#161B22] hover:border-[#484F58]'
                  }`}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{pb.name}</h3>
                    <span className="rounded-full bg-[#D4A843]/20 px-2.5 py-0.5 text-xs font-bold text-[#D4A843]">{pb.match} match</span>
                  </div>
                  <p className="mb-3 text-sm text-[#C9D1D9]">{pb.description}</p>
                  <div className="flex gap-2">
                    {pb.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#30363D] px-2.5 py-0.5 text-xs text-[#8B949E]">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      /* ── Step 6: Complete ────────────────────────────────────────────── */
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-3 text-5xl">🚀</div>
              <h2 className="text-2xl font-bold text-white">You&apos;re All Set!</h2>
              <p className="mt-2 text-[#8B949E]">Here&apos;s what we&apos;ve configured for you:</p>
            </div>

            <div className="space-y-2">
              {SETUP_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-[#30363D] bg-[#161B22] px-4 py-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">
                    ✓
                  </div>
                  <p className="text-sm text-[#C9D1D9]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ── Main Layout ───────────────────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#D4A843] flex items-center justify-center text-[#0D1117] font-bold text-sm">CF</div>
          <span className="text-lg font-bold text-white tracking-tight">CHAMBERFORGE</span>
        </div>
        <p className="text-sm text-[#8B949E]">Step {currentStep} of 6</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6">
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentStep ? 'bg-[#D4A843]' : 'bg-[#30363D]'
              }`} />
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
          {renderStep()}

          {/* Why this matters */}
          <div className="mt-6 rounded-lg border border-[#1F2937] bg-[#161B22] px-4 py-3">
            <p className="text-xs text-[#484F58]">
              <span className="font-semibold text-[#8B949E]">Why this matters:</span>{' '}
              {WHY_NOTES[currentStep]}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="border-t border-[#30363D] px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button onClick={handleBack}
                className="rounded-lg border border-[#30363D] px-5 py-2.5 text-sm font-medium text-[#C9D1D9] transition hover:border-[#484F58]">
                Back
              </button>
            )}
            {currentStep < 6 && (
              <button onClick={handleSkip}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-[#484F58] transition hover:text-[#8B949E]">
                Skip
              </button>
            )}
          </div>

          <button onClick={handleNext} disabled={!canProceed()}
            className="rounded-lg bg-[#D4A843] px-8 py-2.5 text-sm font-bold text-[#0D1117] shadow-lg shadow-[#D4A843]/20 transition hover:bg-[#E0B854] disabled:cursor-not-allowed disabled:opacity-40">
            {currentStep === 1 ? 'Get Started' : currentStep === 6 ? 'Go to Dashboard' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
