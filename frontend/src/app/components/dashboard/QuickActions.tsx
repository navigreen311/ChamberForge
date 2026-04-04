'use client';

import { useRouter } from 'next/navigation';
import { Search, Package, UserPlus, PlayCircle } from 'lucide-react';

const actions = [
  { icon: Search, label: 'Discover Problem', href: '/discover' },
  { icon: Package, label: 'Build Offer', href: '/build/offer/new' },
  { icon: UserPlus, label: 'Add Client', href: '/clients/new' },
  { icon: PlayCircle, label: 'Launch Playbook', href: '/build/playbooks' },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
        QUICK ACTIONS
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="bg-[#0D1117] border border-[#1e2a3a] rounded-lg p-3 text-center cursor-pointer hover:border-[#C9A84C]/40 transition group"
          >
            <action.icon className="mx-auto text-gray-500 group-hover:text-[#C9A84C] transition" size={20} />
            <div className="text-xs text-gray-400 group-hover:text-white mt-1.5 transition">
              {action.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
