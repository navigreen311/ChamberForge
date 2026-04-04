'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Puzzle,
  CreditCard,
  Users,
  Shield,
  Cpu,
  Palette,
  MessageSquare,
  Bell,
} from 'lucide-react';
import clsx from 'clsx';

const navLinks = [
  { label: 'Integrations', href: '/settings/integrations', icon: Puzzle },
  { label: 'Billing', href: '/settings/billing', icon: CreditCard },
  { label: 'Team', href: '/settings/team', icon: Users },
  { label: 'Security', href: '/settings/security', icon: Shield },
  { label: 'AI Runtime', href: '/settings/ai-runtime', icon: Cpu },
  { label: 'White-Label', href: '/settings/white-label', icon: Palette },
  { label: 'AI Feedback', href: '/settings/ai-feedback', icon: MessageSquare },
  { label: 'Notifications', href: '/settings/notifications', icon: Bell },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-chamber-950">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 border-r border-chamber-800 bg-chamber-950">
        <div className="sticky top-0 flex flex-col gap-1 p-4">
          <h2 className="mb-3 px-3 text-lg font-display font-bold text-white">
            Settings
          </h2>

          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(link.href + '/');
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-r-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'border-l-2 border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
                      : 'border-l-2 border-transparent text-gray-400 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Content area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
