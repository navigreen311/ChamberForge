'use client';

import Link from 'next/link';
import { Bell, Search } from 'lucide-react';

const navTabs = [
  { label: 'Dashboard', href: '/dashboard', active: true },
  { label: 'Discover', href: '/discover', active: false },
  { label: 'Offers', href: '/offers', active: false },
  { label: 'Clients', href: '/clients', active: false },
  { label: 'Playbooks', href: '/playbooks', active: false },
  { label: 'Deliver', href: '/deliver', active: false },
];

export default function TopBar() {
  return (
    <header
      className="h-14 flex items-center justify-between px-6 bg-[#111827] border-b border-[#1e2a3a]"
    >
      {/* Left: Logo + Nav Tabs */}
      <div className="flex items-center gap-6">
        <span className="text-[#C9A84C] font-bold tracking-widest text-lg select-none">
          CHAMBERFORGE
        </span>

        <nav className="flex items-center gap-1">
          {navTabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-3 py-4 text-sm transition-colors ${
                tab.active
                  ? 'text-[#C9A84C] border-b-2 border-[#C9A84C]'
                  : 'text-gray-400 hover:text-white border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Center: Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search problems, offers, clients..."
          className="w-[280px] bg-[#0D1117] border border-[#1e2a3a] rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-[#C9A84C] focus:outline-none transition-colors"
        />
      </div>

      {/* Right: Notifications + User Chip */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2 rounded-full bg-[#1e2a3a] px-3 py-1">
          <span className="text-sm text-white">Ivan</span>
          <span className="text-[10px] bg-[#C9A84C]/20 text-[#C9A84C] px-1.5 rounded">
            ENTERPRISE
          </span>
        </div>
      </div>
    </header>
  );
}
