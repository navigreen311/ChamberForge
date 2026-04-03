'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Breadcrumbs from './Breadcrumbs';
import { useAuth } from '@/hooks/useAuth';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-chamber-950">
      {/* Sidebar — hidden on mobile unless mobileOpen, always visible on md+ */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          isAdmin={isAdmin}
        />
      </div>

      {/* Mobile sidebar (rendered separately for overlay behavior) */}
      <div className="md:hidden">
        <Sidebar
          collapsed={false}
          onToggle={() => setCollapsed((c) => !c)}
          isAdmin={isAdmin}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content area — full width on mobile */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setMobileOpen((o) => !o)} />

        {/* Breadcrumbs */}
        <div className="border-b border-chamber-800/50 px-4 py-2 sm:px-6">
          <Breadcrumbs />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
