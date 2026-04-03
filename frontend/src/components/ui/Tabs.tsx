'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab headers */}
      <div className="flex border-b border-chamber-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              tab.id === activeTab
                ? 'text-gold-400'
                : 'text-chamber-400 hover:text-chamber-200',
            )}
          >
            {tab.label}
            {tab.id === activeTab && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold-400" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-4">{activeContent}</div>
    </div>
  );
}
