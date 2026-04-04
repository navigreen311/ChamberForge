'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, Settings, Sparkles } from 'lucide-react'

interface TopBarProps {
  activePage?: string
}

const primaryTabs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Discover', href: '/discover' },
  { label: 'Offers', href: '/offers' },
  { label: 'Clients', href: '/clients' },
  { label: 'Playbooks', href: '/playbooks' },
  { label: 'Deliver', href: '/deliver' },
]

const secondaryTabs = [
  { label: 'Revenue', href: '/sell/revenue' },
  { label: 'Evidence', href: '/discover/evidence' },
  { label: 'Partners', href: '/partners' },
  { label: 'Exports', href: '/exports' },
  { label: 'Automation', href: '/automation' },
  { label: 'Risk Queue', href: '/qualify/risk-queue' },
]

export default function TopBar({ activePage }: TopBarProps) {
  const pathname = usePathname()
  const [showSecondary, setShowSecondary] = useState(false)

  const active = activePage || primaryTabs.find(t => pathname.startsWith(t.href))?.label || ''

  const isSecondaryActive = secondaryTabs.some(
    t => activePage === t.label || pathname.startsWith(t.href)
  )

  return (
    <div
      onMouseEnter={() => setShowSecondary(true)}
      onMouseLeave={() => setShowSecondary(false)}
    >
      {/* Primary Nav */}
      <header className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[#C9A84C] font-bold tracking-widest text-lg select-none">
            CHAMBERFORGE
          </Link>
          <nav className="flex gap-1">
            {primaryTabs.map(tab => {
              const isActive = tab.label === active
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`px-3 py-4 text-sm transition-colors ${
                    isActive
                      ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                      : 'text-gray-400 hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Command AI + actions + user */}
        <div className="flex items-center gap-3">
          <Link
            href="/command"
            className="flex items-center gap-1.5 bg-[#C9A84C] text-[#0D1117] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#C9A84C]/90 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Command AI
          </Link>
          <Link href="/notifications" className="relative cursor-pointer text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
          <Link href="/search" className="text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/settings" className="text-gray-400 hover:text-white transition-colors">
            <Settings className="w-4.5 h-4.5" />
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-[#1e2a3a] px-3 py-1 ml-1">
            <span className="text-sm text-white">Ivan</span>
            <span className="text-[10px] bg-[#C9A84C]/20 text-[#C9A84C] px-1.5 rounded">ENTERPRISE</span>
          </div>
        </div>
      </header>

      {/* Secondary Nav — shown on hover or if a secondary tab is active */}
      {(showSecondary || isSecondaryActive) && (
        <div className="h-9 flex items-center gap-4 px-6 bg-[#0f1520] border-b border-[#1e2a3a]">
          {secondaryTabs.map(tab => {
            const isActive = tab.label === activePage || pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`text-xs transition-colors ${
                  isActive
                    ? 'text-[#C9A84C] font-medium'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
