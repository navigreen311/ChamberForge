'use client';

import { useRouter, usePathname } from 'next/navigation';
import { User, Building2, Users, BarChart3, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const tabs = [
  { label: 'Profile', href: '/settings/profile', icon: User },
  { label: 'Workspace', href: '/settings/workspace', icon: Building2 },
  { label: 'Members', href: '/settings/members', icon: Users },
  { label: 'Usage', href: '/settings/usage', icon: BarChart3 },
  { label: 'Danger Zone', href: '/settings/danger', icon: AlertTriangle },
] as const;

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">Settings</h1>
      <p className="text-chamber-400 mb-6 sm:mb-8">
        Manage your profile, workspace, team members, and account.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isDanger = tab.label === 'Danger Zone';
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={clsx(
                'flex items-center gap-4 rounded-xl border p-6 text-left transition-colors',
                isDanger
                  ? 'border-red-800/50 bg-red-950/20 hover:border-red-600 hover:bg-red-950/40'
                  : 'border-chamber-800 bg-chamber-900 hover:border-gold-400/50 hover:bg-chamber-800',
              )}
            >
              <div
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  isDanger ? 'bg-red-900/50 text-red-400' : 'bg-chamber-800 text-gold-400',
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={clsx(
                    'font-semibold',
                    isDanger ? 'text-red-400' : 'text-white',
                  )}
                >
                  {tab.label}
                </p>
                <p className="text-sm text-chamber-400">
                  {tab.label === 'Profile' && 'Name, email, password'}
                  {tab.label === 'Workspace' && 'Name, slug, configuration'}
                  {tab.label === 'Members' && 'Invite, roles, manage team'}
                  {tab.label === 'Usage' && 'Stats, AI calls, storage'}
                  {tab.label === 'Danger Zone' && 'Delete account, export data'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
