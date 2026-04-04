'use client'

import { useState } from 'react'
import Link from 'next/link'
import TopBar from '../../components/shared/TopBar'
import CommandAIButton from '../../components/shared/CommandAIButton'

// ─── Progress Steps ──────────────────────────────────────────
const STEPS = [
  { label: 'Find', description: 'Discover opportunities' },
  { label: 'Pick', description: 'Choose the best one' },
  { label: 'Build', description: 'Create your service' },
  { label: 'Land', description: 'Get your first client' },
]

// ─── Clients ─────────────────────────────────────────────────
const CLIENTS = [
  {
    name: 'Sarah Chen',
    status: 'Going great',
    statusColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  {
    name: 'Wellington Trust',
    status: 'Needs attention',
    statusColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  {
    name: 'Marcus Reid',
    status: 'New',
    statusColor: 'text-blue-400',
    dotColor: 'bg-blue-400',
  },
]

// ─── Deliverables ────────────────────────────────────────────
const DELIVERABLES = [
  {
    title: 'Incident Response Plan for Wellington Trust',
    status: '2 days late',
    statusColor: 'text-red-400',
    action: 'Finish it now',
  },
  {
    title: 'Monthly security report for Sarah Chen',
    status: 'Due in 3 days',
    statusColor: 'text-amber-400',
    action: 'Start working',
  },
  {
    title: 'Onboarding packet for Marcus Reid',
    status: 'On track',
    statusColor: 'text-emerald-400',
    action: 'Review progress',
  },
]

// ─── Action Items ────────────────────────────────────────────
const ACTION_ITEMS = [
  {
    text: 'Call Wellington Trust — you haven\'t spoken in 12 days',
    action: 'Schedule call',
  },
  {
    text: 'The IR plan for Wellington is 2 days late',
    action: 'Work on it',
  },
  {
    text: 'Marcus Reid just sold his company — reach out now!',
    action: 'Send message',
  },
]

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

export default function SimpleDashboardPage() {
  const [currentStep] = useState(0)

  // Time-based greeting
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      <TopBar activePage="Dashboard" />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Greeting ───────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {greeting}, Ivan.
          </h1>
          <p className="text-lg text-gray-400 mt-1">
            Here&apos;s what matters today.
          </p>
        </div>

        {/* ── Progress Bar ────────────────────────────────── */}
        <ProgressBar currentStep={currentStep} />

        {/* ── 3 Big Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Biggest Opportunity */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Your biggest opportunity right now
              </h2>
            </div>
            <p className="text-white text-lg font-semibold mb-2">
              Protecting wealthy families from online scams
            </p>
            <p className="text-emerald-400 text-xl font-bold mb-4">
              This could earn you $10,000–$25,000/month
            </p>
            <div className="mt-auto">
              <Link
                href="/discover"
                className="inline-block w-full text-center px-5 py-3 bg-[#C9A84C] hover:bg-[#b8993f] text-black font-semibold rounded-lg transition-colors"
              >
                Start building this service
              </Link>
            </div>
          </div>

          {/* Card 2: Business Health */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📊</span>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                How your business is doing
              </h2>
            </div>
            <p className="text-emerald-400 text-3xl font-bold mb-2">
              $75,000/month
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 text-sm">
                Everything is running smoothly
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-auto">
              3 active clients, all healthy.
            </p>
          </div>

          {/* Card 3: Attention Items */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚡</span>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                What needs your attention today
              </h2>
            </div>
            <div className="space-y-3 flex-1">
              {ACTION_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3"
                >
                  <p className="text-gray-300 text-sm leading-snug flex-1">
                    {item.text}
                  </p>
                  <button className="shrink-0 px-3 py-1 text-xs bg-[#1e2a3a] hover:bg-[#2a3a4e] text-[#C9A84C] rounded-md transition-colors whitespace-nowrap">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Simple Client List + Deliverables ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Client List */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Your clients
            </h2>
            <div className="space-y-3">
              {CLIENTS.map((client) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between bg-[#0b1120] border border-[#1e2a3a] rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${client.dotColor}`}
                    />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {client.name}
                      </p>
                      <p className={`text-xs ${client.statusColor}`}>
                        {client.status}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 text-xs bg-[#1e2a3a] hover:bg-[#2a3a4e] text-[#C9A84C] rounded-md transition-colors">
                    Talk to them
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              What&apos;s due
            </h2>
            <div className="space-y-3">
              {DELIVERABLES.map((d) => (
                <div
                  key={d.title}
                  className="flex items-center justify-between bg-[#0b1120] border border-[#1e2a3a] rounded-lg px-4 py-3"
                >
                  <div className="flex-1 mr-3">
                    <p className="text-white text-sm font-medium">{d.title}</p>
                    <p className={`text-xs ${d.statusColor}`}>{d.status}</p>
                  </div>
                  <button className="shrink-0 px-4 py-1.5 text-xs bg-[#1e2a3a] hover:bg-[#2a3a4e] text-[#C9A84C] rounded-md transition-colors whitespace-nowrap">
                    {d.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <CommandAIButton />
    </div>
  )
}
