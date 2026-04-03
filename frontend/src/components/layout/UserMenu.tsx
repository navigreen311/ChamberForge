'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Moon, Sun, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-chamber-950 hover:bg-gold-300"
        aria-label="User menu"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-chamber-800 bg-chamber-900 py-1 shadow-xl">
          {/* User info */}
          <div className="border-b border-chamber-800 px-4 py-3">
            <p className="text-sm font-medium text-white">{user?.name ?? 'User'}</p>
            <p className="text-xs text-chamber-400">{user?.email ?? ''}</p>
          </div>

          <div className="py-1">
            <MenuButton icon={User} label="Profile" onClick={() => setOpen(false)} />
            <MenuButton icon={Settings} label="Workspace Settings" onClick={() => setOpen(false)} />
            <MenuButton
              icon={darkMode ? Sun : Moon}
              label={darkMode ? 'Light Mode' : 'Dark Mode'}
              onClick={toggleTheme}
            />
          </div>

          <div className="border-t border-chamber-800 py-1">
            <MenuButton icon={LogOut} label="Logout" onClick={logout} danger />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
        danger
          ? 'text-red-400 hover:bg-red-900/30'
          : 'text-chamber-300 hover:bg-chamber-800 hover:text-white',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
