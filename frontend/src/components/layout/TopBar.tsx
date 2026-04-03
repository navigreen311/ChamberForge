'use client';

import { Menu, Search, Bell } from 'lucide-react';
import UserMenu from './UserMenu';
import { useConnectionStatus } from '@/hooks/useRealtime';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const wsStatus = useConnectionStatus();
  const isConnected = wsStatus === 'connected';
  const isDisabled = wsStatus === 'disabled';

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-gray-200 dark:border-chamber-800 bg-white dark:bg-chamber-950 px-4">
      {/* Left: hamburger (mobile) + logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-md p-1.5 text-gray-400 dark:text-chamber-400 hover:bg-gray-100 dark:hover:bg-chamber-800 hover:text-gray-900 dark:hover:text-white lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-display text-lg font-bold text-gold-400 lg:hidden">
          ChamberForge
        </span>
      </div>

      {/* Center: search bar */}
      <div className="mx-auto hidden w-full max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-chamber-500" />
          <input
            type="search"
            placeholder="Search problems, offers, clients..."
            className="w-full rounded-lg border border-gray-300 dark:border-chamber-700 bg-white dark:bg-chamber-800 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-chamber-500 focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
          />
        </div>
      </div>

      {/* Right: mobile search icon + connection dot + notifications + user menu */}
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Mobile search icon */}
        <button
          className="rounded-md p-2 text-gray-400 dark:text-chamber-400 hover:bg-gray-100 dark:hover:bg-chamber-800 hover:text-gray-900 dark:hover:text-white md:hidden"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* WebSocket connection status indicator */}
        {!isDisabled && (
          <span
            className={`hidden h-2 w-2 rounded-full sm:inline-block ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}
            title={`WebSocket: ${wsStatus}`}
          />
        )}

        <button
          className="relative rounded-md p-2 text-gray-400 dark:text-chamber-400 hover:bg-gray-100 dark:hover:bg-chamber-800 hover:text-gray-900 dark:hover:text-white"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {/* Unread dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400" />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
