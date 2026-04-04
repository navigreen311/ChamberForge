'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, X } from 'lucide-react'
import UserMenu from '@/components/layout/UserMenu'

const navTabs = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Pipeline', href: '/dashboard/pipeline' },
  { label: 'Clients', href: '/dashboard/clients' },
  { label: 'Tasks', href: '/dashboard/tasks' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Settings', href: '/settings' },
]

interface MobileTopBarProps {
  onMenuToggle?: () => void
  activeTab?: string
}

export default function MobileTopBar({ onMenuToggle, activeTab = 'Overview' }: MobileTopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  return (
    <div className="md:hidden">
      {/* Main bar: hamburger + logo + search icon + bell + avatar */}
      <header className="flex h-14 items-center border-b border-chamber-800 bg-[#0D1117] px-4">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="rounded-md p-1.5 text-chamber-400 hover:bg-chamber-800 hover:text-white"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-lg font-bold text-gold-400">
            ChamberForge
          </span>
        </div>

        {/* Right: search + bell + avatar */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-md p-2 text-chamber-400 hover:bg-chamber-800 hover:text-white"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          <button
            className="relative rounded-md p-2 text-chamber-400 hover:bg-chamber-800 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400" />
          </button>

          <UserMenu />
        </div>
      </header>

      {/* Search dropdown sheet */}
      {searchOpen && (
        <div className="border-b border-chamber-800 bg-[#0D1117] px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chamber-500" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search problems, offers, clients..."
              className="w-full rounded-lg border border-chamber-700 bg-chamber-800 py-2 pl-10 pr-4 text-sm text-white placeholder:text-chamber-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
            />
          </div>
        </div>
      )}

      {/* Horizontal scrollable nav tabs */}
      <nav className="border-b border-chamber-800 bg-[#0D1117]">
        <div className="flex overflow-x-auto scrollbar-hide px-4">
          {navTabs.map((tab) => (
            <a
              key={tab.label}
              href={tab.href}
              className={`whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.label
                  ? 'border-b-2 border-gold-400 text-gold-400'
                  : 'text-chamber-400 hover:text-white'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
