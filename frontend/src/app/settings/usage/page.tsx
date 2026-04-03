'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ArrowLeft, FileText, Zap, Users, Brain, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface UsageStats {
  problems_created: number;
  offers_active: number;
  members_count: number;
  ai_calls_this_month: number;
  ai_cost_this_month: number;
}

export default function UsageSettingsPage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<UsageStats>('/api/v1/workspace-settings/usage')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: 'Problems Created', value: stats.problems_created, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/20' },
        { label: 'Offers Active', value: stats.offers_active, icon: Zap, color: 'text-green-400', bg: 'bg-green-400/20' },
        { label: 'Team Members', value: stats.members_count, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/20' },
        { label: 'AI Calls This Month', value: stats.ai_calls_this_month, icon: Brain, color: 'text-gold-400', bg: 'bg-gold-400/20' },
        { label: 'AI Cost This Month', value: `$${stats.ai_cost_this_month.toFixed(2)}`, icon: DollarSign, color: 'text-red-400', bg: 'bg-red-400/20' },
      ]
    : [];

  // Simple bar chart data for visual
  const maxVal = stats
    ? Math.max(stats.problems_created, stats.offers_active, stats.members_count, stats.ai_calls_this_month, 1)
    : 1;

  return (
    <div className="min-h-screen bg-chamber-950 p-8 max-w-4xl mx-auto">
      <Link href="/settings" className="inline-flex items-center gap-2 text-chamber-400 hover:text-white mb-6 transition">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Usage Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-chamber-800" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-chamber-900 rounded-xl border border-chamber-800 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <span className="text-sm text-chamber-400">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Bar chart */}
          {stats && (
            <div className="bg-chamber-900 rounded-xl border border-chamber-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
              <div className="space-y-4">
                {[
                  { label: 'Problems', value: stats.problems_created, color: 'bg-blue-400' },
                  { label: 'Active Offers', value: stats.offers_active, color: 'bg-green-400' },
                  { label: 'Members', value: stats.members_count, color: 'bg-purple-400' },
                  { label: 'AI Calls', value: stats.ai_calls_this_month, color: 'bg-gold-400' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-chamber-400">{bar.label}</span>
                      <span className="text-sm text-chamber-300">{bar.value}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-chamber-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                        style={{ width: `${Math.max((bar.value / maxVal) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
