'use client'

import { useState } from 'react'

// ─── Progress Steps ──────────────────────────────────────────
const STEPS = [
  { label: 'Find', description: 'Discover opportunities' },
  { label: 'Pick', description: 'Choose the best one' },
  { label: 'Build', description: 'Create your service' },
  { label: 'Land', description: 'Get your first client' },
]

// ─── Filter Options ──────────────────────────────────────────
const PERSON_FILTERS = [
  'Ultra-rich families',
  'High-earning executives',
  'Family businesses',
  'All',
]

const COMFORT_FILTERS = [
  'Tech & security',
  'Organization & management',
  'Privacy',
  'Health',
  'All',
]

const SPEED_FILTERS = ['Right now', '3 months', 'Exploring']

// ─── Problem Cards ───────────────────────────────────────────
const PROBLEMS = [
  {
    title: 'Protecting wealthy families from online scams',
    money: '$10,000–$25,000/month',
    badge: 'Hot opportunity',
    badgeColor: 'bg-red-500/20 text-red-400',
    description:
      "Criminals are using AI to copy people's voices and steal money. Rich families need protection but most don't have it.",
  },
  {
    title: 'Managing the chaos of a busy rich lifestyle',
    money: '$15,000–$30,000/month',
    badge: 'Good match for you',
    badgeColor: 'bg-[#C9A84C]/20 text-[#C9A84C]',
    description:
      'People who just got rich suddenly have 3 houses, 10 staff, and endless appointments. They need someone to run it all.',
  },
  {
    title: 'Stopping data companies from tracking wealthy people',
    money: '$8,000–$18,000/month',
    badge: 'Proven winner',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
    description:
      'Companies sell personal info about rich people — where they live, where their kids go to school. Families pay to make this stop.',
  },
  {
    title: 'Helping wealthy families plan for the next generation',
    money: '$15,000–$35,000/quarter',
    badge: 'Rising fast',
    badgeColor: 'bg-purple-500/20 text-purple-400',
    description:
      'When parents pass wealth to children, things go wrong. Families need help making this smooth.',
  },
  {
    title: 'Making healthcare work for busy executives',
    money: '$8,000–$20,000/month',
    badge: 'New opportunity',
    badgeColor: 'bg-blue-500/20 text-blue-400',
    description:
      'Rich people have the same broken healthcare system as everyone else. They pay for someone to coordinate it all.',
  },
]

// ─── KPIs ────────────────────────────────────────────────────
const KPIS = [
  { label: 'Opportunities found', value: '47' },
  { label: 'Reports checked', value: '23' },
  { label: 'Hot right now', value: '8' },
  { label: 'Research quality', value: '7.8/10' },
  { label: 'Needs updating', value: '3' },
]

// ─── Radio Group Component ───────────────────────────────────
function RadioGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string
  onChange: (val: string) => void
}) {
  return (
    <div className="mb-5">
      <p className="text-sm text-gray-300 font-medium mb-2">{label}</p>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                selected === opt
                  ? 'border-[#C9A84C] bg-[#C9A84C]/20'
                  : 'border-gray-600 group-hover:border-gray-400'
              }`}
            >
              {selected === opt && (
                <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
              )}
            </span>
            <span className="text-sm text-gray-400 group-hover:text-gray-300">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Progress Bar Component ──────────────────────────────────
function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5 mb-6">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
        Your journey
      </p>
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  i < currentStep
                    ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                    : i === currentStep
                    ? 'bg-[#C9A84C]/20 text-[#C9A84C] border-2 border-[#C9A84C] ring-4 ring-[#C9A84C]/10'
                    : 'bg-gray-800 text-gray-500 border-2 border-gray-700'
                }`}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <p
                className={`text-xs mt-2 font-medium ${
                  i === currentStep
                    ? 'text-[#C9A84C]'
                    : i < currentStep
                    ? 'text-emerald-400'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {step.description}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 rounded ${
                  i < currentStep ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function SimpleDiscoverContent() {
  const [currentStep] = useState(0)
  const [personFilter, setPersonFilter] = useState('All')
  const [comfortFilter, setComfortFilter] = useState('All')
  const [speedFilter, setSpeedFilter] = useState('Exploring')

  return (
    <div className="text-white">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Find your money-making opportunity
        </h1>
        <p className="text-gray-400 mt-1 max-w-2xl">
          ChamberForge scans research reports and government warnings to find
          real problems that wealthy people pay good money to solve.
        </p>
      </div>

      {/* ── KPIs ───────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-3"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              {kpi.label}
            </p>
            <p className="text-lg font-semibold text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Progress Bar ───────────────────────────────── */}
      <ProgressBar currentStep={currentStep} />

      {/* ── Content: Sidebar + Cards ───────────────────── */}
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5 sticky top-24">
            <h3 className="text-sm font-semibold text-white mb-4">
              Help me narrow it down
            </h3>
            <RadioGroup
              label="What kind of person do you want to help?"
              options={PERSON_FILTERS}
              selected={personFilter}
              onChange={setPersonFilter}
            />
            <RadioGroup
              label="What are you most comfortable with?"
              options={COMFORT_FILTERS}
              selected={comfortFilter}
              onChange={setComfortFilter}
            />
            <RadioGroup
              label="How fast do you want to start?"
              options={SPEED_FILTERS}
              selected={speedFilter}
              onChange={setSpeedFilter}
            />
          </div>
        </aside>

        {/* Problem Cards */}
        <div className="flex-1 space-y-4">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6 hover:border-[#2a3a4e] transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${problem.badgeColor}`}
                    >
                      {problem.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {problem.title}
                  </h3>
                </div>
                <button
                  className="shrink-0 w-7 h-7 rounded-full border border-gray-700 hover:border-gray-500 flex items-center justify-center text-gray-500 hover:text-gray-300 text-xs transition-colors"
                  title="Learn more about this opportunity"
                >
                  ?
                </button>
              </div>

              <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                {problem.description}
              </p>

              <p className="text-emerald-400 text-lg font-bold mb-4">
                {problem.money}
              </p>

              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 bg-[#C9A84C] hover:bg-[#b8993f] text-black font-semibold rounded-lg text-sm transition-colors">
                  Start building this service
                </button>
                <button className="px-5 py-2.5 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-gray-300 rounded-lg text-sm transition-colors">
                  Show me another
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
