'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Search,
  CheckSquare,
  Hammer,
  TrendingUp,
  Shield,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  X,
} from 'lucide-react';

// ─── Navigation structure matching ChamberForge 10 layers ────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Discover',
    href: '/discover',
    icon: Search,
    children: [
      { label: 'Problems', href: '/discover/problems' },
      { label: 'Evidence', href: '/discover/evidence' },
      { label: 'Trends', href: '/discover/trends' },
    ],
  },
  {
    label: 'Qualify',
    href: '/qualify',
    icon: CheckSquare,
    children: [
      { label: 'Validate', href: '/qualify/validate' },
      { label: 'Buyer Profile', href: '/qualify/buyer-profile' },
      { label: 'Guardrails', href: '/qualify/guardrails' },
      { label: 'Risk Queue', href: '/qualify/risk-queue' },
      { label: 'Readiness', href: '/qualify/readiness' },
    ],
  },
  {
    label: 'Build',
    href: '/build',
    icon: Hammer,
    children: [
      { label: 'Offers', href: '/build/offers' },
      { label: 'Pricing', href: '/build/pricing' },
      { label: 'Playbooks', href: '/build/playbooks' },
      { label: 'Fulfillment', href: '/build/fulfillment' },
      { label: 'Deal Desk', href: '/build/deal-desk' },
      { label: 'Trust Pack', href: '/build/trust-pack' },
      { label: 'Household Graph', href: '/build/household-graph' },
      { label: 'Billing', href: '/build/billing' },
    ],
  },
  {
    label: 'Sell & Retain',
    href: '/sell',
    icon: TrendingUp,
    children: [
      { label: 'Marketing', href: '/sell/marketing' },
      { label: 'Revenue', href: '/sell/revenue' },
      { label: 'Persona Sim', href: '/sell/persona-sim' },
      { label: 'Onboarding', href: '/sell/onboarding' },
      { label: 'Retention', href: '/sell/retention' },
      { label: 'Decision Room', href: '/sell/decision-room' },
    ],
  },
  {
    label: 'Compliance',
    href: '/compliance',
    icon: Shield,
    children: [
      { label: 'Consent', href: '/compliance/consent' },
      { label: 'Explainability', href: '/compliance/explainability' },
      { label: 'Quality', href: '/compliance/quality' },
      { label: 'Comms', href: '/compliance/comms' },
      { label: 'Benchmarks', href: '/compliance/benchmarks' },
    ],
  },
  {
    label: 'Lifecycle',
    href: '/lifecycle',
    icon: RefreshCw,
    children: [
      { label: 'Intel Briefs', href: '/lifecycle/intel-briefs' },
      { label: 'Health', href: '/lifecycle/health' },
      { label: 'Scenario', href: '/lifecycle/scenario' },
      { label: 'Trainer', href: '/lifecycle/trainer' },
      { label: 'Alumni', href: '/lifecycle/alumni' },
    ],
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Settings,
    adminOnly: true,
    children: [
      { label: 'Eval Lab', href: '/admin/eval-lab' },
      { label: 'Entitlements', href: '/admin/entitlements' },
      { label: 'Rules', href: '/admin/rules' },
      { label: 'Runtime', href: '/admin/runtime' },
      { label: 'Jobs', href: '/admin/jobs' },
      { label: 'Email', href: '/admin/email' },
      { label: 'Documents', href: '/admin/documents' },
    ],
  },
];

// ─── Sidebar Component ───────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, isAdmin = false, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGroup = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const filteredNav = navigation.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={clsx(
          'flex h-screen flex-col border-r border-chamber-800 bg-chamber-950 transition-all duration-200',
          collapsed ? 'w-16' : 'w-[260px]',
          // Mobile: fixed overlay
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:w-[280px]',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'max-md:transition-transform max-md:duration-300 max-md:ease-in-out',
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-chamber-800 px-4">
          <div>
            {!collapsed && (
              <span className="font-display text-lg font-bold text-gold-400">
                ChamberForge
              </span>
            )}
            {collapsed && (
              <span className="mx-auto font-display text-lg font-bold text-gold-400">
                CF
              </span>
            )}
          </div>
          {/* Close button on mobile */}
          <button
            onClick={onMobileClose}
            className="rounded-md p-1.5 text-chamber-400 hover:bg-chamber-800 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const isOpen = expanded[item.label];
            const hasChildren = item.children && item.children.length > 0;

            return (
              <li key={item.label}>
                {/* Parent item */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={clsx(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'border-l-2 border-gold-400 bg-chamber-900 text-white'
                        : 'text-chamber-300 hover:bg-chamber-900 hover:text-white',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-chamber-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-chamber-500" />
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'border-l-2 border-gold-400 bg-chamber-900 text-white'
                        : 'text-chamber-300 hover:bg-chamber-900 hover:text-white',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )}

                {/* Sub-items */}
                {hasChildren && isOpen && !collapsed && (
                  <ul className="ml-8 mt-1 space-y-0.5">
                    {item.children!.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={clsx(
                              'block rounded-md px-3 py-1.5 text-sm transition-colors',
                              childActive
                                ? 'border-l-2 border-gold-400 bg-chamber-800/60 text-gold-400'
                                : 'text-chamber-400 hover:bg-chamber-800/40 hover:text-white',
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle — hidden on mobile */}
      <div className="hidden border-t border-chamber-800 p-2 md:block">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-chamber-400 hover:bg-chamber-900 hover:text-white"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
