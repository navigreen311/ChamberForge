"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface DashboardStats {
  totalCost: number;
  activeFlags: number;
  pendingHolds: number;
  sandboxCount: number;
}

export default function AdminHub() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCost: 0,
    activeFlags: 0,
    pendingHolds: 0,
    sandboxCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [trustRes] = await Promise.all([
          fetch(`${API}/api/v1/primitives/trust-center/overview`),
        ]);
        if (trustRes.ok) {
          await trustRes.json();
        }
      } catch {
        // API may not be running in dev
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    {
      title: "AI Costs (MTD)",
      value: `$${stats.totalCost.toFixed(2)}`,
      href: "/admin/runtime",
      color: "text-gold-400",
    },
    {
      title: "Active Feature Flags",
      value: stats.activeFlags.toString(),
      href: "/admin/entitlements",
      color: "text-emerald-400",
    },
    {
      title: "Pending Legal Holds",
      value: stats.pendingHolds.toString(),
      href: "#",
      color: "text-red-400",
    },
    {
      title: "Active Sandboxes",
      value: stats.sandboxCount.toString(),
      href: "#",
      color: "text-blue-400",
    },
  ];

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gold-400 mb-2">
          Admin Hub
        </h1>
        <p className="text-chamber-400 mb-8">
          Platform Primitives management dashboard
        </p>

        {loading ? (
          <div className="text-chamber-400">Loading dashboard...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {cards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="bg-chamber-900 border border-chamber-700 rounded-lg p-6 hover:border-gold-500 transition-colors"
                >
                  <div className="text-chamber-400 text-sm mb-1">
                    {card.title}
                  </div>
                  <div className={`text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            <h2 className="text-xl font-semibold text-white mb-4">
              Platform Primitives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: "AI Eval Lab",
                  desc: "Prompt versioning, regression testing, rollback",
                  href: "/admin/eval-lab",
                },
                {
                  name: "Entitlements",
                  desc: "Feature flags, plan matrix, gating",
                  href: "/admin/entitlements",
                },
                {
                  name: "Rules Engine",
                  desc: "Automation rules, triggers, actions",
                  href: "/admin/rules",
                },
                {
                  name: "AI Runtime",
                  desc: "Cost tracking, budgets, agent performance",
                  href: "/admin/runtime",
                },
                {
                  name: "Trust Center",
                  desc: "Security overview, uptime, compliance",
                  href: "#",
                },
                {
                  name: "Records Governance",
                  desc: "Retention policies, legal holds",
                  href: "#",
                },
                {
                  name: "Sandbox",
                  desc: "Demo environments, synthetic data",
                  href: "#",
                },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="bg-chamber-900 border border-chamber-800 rounded-lg p-5 hover:border-gold-500/50 transition-colors"
                >
                  <div className="text-white font-semibold mb-1">
                    {item.name}
                  </div>
                  <div className="text-chamber-400 text-sm">{item.desc}</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
