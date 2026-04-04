'use client';

import { useRouter } from 'next/navigation';
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

const cards = [
  {
    label: 'Integrations',
    href: '/settings/integrations',
    icon: Puzzle,
    description: 'Connect CRMs, APIs, and third-party tools',
  },
  {
    label: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
    description: 'Plans, invoices, and payment methods',
  },
  {
    label: 'Team',
    href: '/settings/team',
    icon: Users,
    description: 'Invite members, assign roles',
  },
  {
    label: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'MFA, sessions, and access controls',
  },
  {
    label: 'AI Runtime',
    href: '/settings/ai-runtime',
    icon: Cpu,
    description: 'Model selection, token limits, fallback chains',
  },
  {
    label: 'White-Label',
    href: '/settings/white-label',
    icon: Palette,
    description: 'Branding, colors, logos, and custom domains',
  },
  {
    label: 'AI Feedback',
    href: '/settings/ai-feedback',
    icon: MessageSquare,
    description: 'Review AI outputs, thumbs up/down, retraining',
  },
  {
    label: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Email, in-app, and webhook alert preferences',
  },
] as const;

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-1">
        Settings Overview
      </h1>
      <p className="text-gray-400 mb-8">
        Manage your workspace configuration, integrations, and preferences.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              className="flex flex-col gap-3 rounded-xl border border-chamber-800 bg-chamber-900 p-5 text-left transition-colors hover:border-[#C9A84C]/50 hover:bg-chamber-800"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chamber-800 text-[#C9A84C]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">{card.label}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
