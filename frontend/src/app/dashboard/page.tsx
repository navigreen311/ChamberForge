"use client";

import { useEffect, useState } from "react";
import NextActionCard from "@/components/modules/NextActionCard";
import MetricCard from "@/components/modules/MetricCard";
import AgentStatusGrid from "@/components/modules/AgentStatusGrid";
import DailyBriefPanel from "@/components/modules/DailyBriefPanel";
import OpportunityRanker from "@/components/modules/OpportunityRanker";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function fetchJSON(path: string) {
  try {
    const res = await fetch(`${API}${path}`);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const [nextAction, setNextAction] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [brief, setBrief] = useState<any>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [na, db, opps, br, st] = await Promise.all([
        fetchJSON("/api/v1/command/next-action"),
        fetchJSON("/api/v1/command/dashboard"),
        fetchJSON("/api/v1/command/opportunities"),
        fetchJSON("/api/v1/command/daily-brief"),
        fetchJSON("/api/v1/command/agent-status"),
      ]);
      setNextAction(na);
      setDashboard(db);
      setOpportunities(Array.isArray(opps) ? opps : opps?.opportunities ?? []);
      setBrief(br);
      setAgentStatuses(st ?? {});
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  const metrics = dashboard
    ? [
        {
          label: "Active Clients",
          value: dashboard.client_health_summary?.healthy ?? 0,
          trend: "up" as const,
          sparkline: [30, 34, 38, 42],
        },
        {
          label: "At Risk",
          value: dashboard.client_health_summary?.at_risk ?? 0,
          trend: "down" as const,
          sparkline: [8, 7, 6, 5],
        },
        {
          label: "MTD Revenue",
          value: `$${((dashboard.revenue_snapshot?.mtd ?? 0) / 1000).toFixed(0)}K`,
          trend: "up" as const,
          sparkline: [80, 95, 110, 125],
        },
        {
          label: "Pending Risks",
          value: dashboard.pending_risks?.length ?? 0,
          trend:
            (dashboard.pending_risks?.length ?? 0) > 2
              ? ("down" as const)
              : ("flat" as const),
          sparkline: [3, 2, 3, 2],
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-chamber-950 px-4 py-8 sm:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gold-400">
          Command Center
        </h1>
        <p className="mt-1 text-chamber-400">
          Your AI-powered strategic overview
        </p>
      </header>

      {/* Hero — Next Best Action */}
      <section className="mb-6">
        <NextActionCard action={nextAction} />
      </section>

      {/* Metric Cards Row */}
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </section>

      {/* Two-column: Agent Status + Daily Brief */}
      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <AgentStatusGrid statuses={agentStatuses} />
        <DailyBriefPanel brief={brief} />
      </section>

      {/* Opportunity Ranker */}
      <section className="mb-6">
        <OpportunityRanker opportunities={opportunities} />
      </section>

      {/* Alerts from dashboard */}
      {dashboard?.urgent_actions && dashboard.urgent_actions.length > 0 && (
        <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-400">
            Urgent Actions
          </h3>
          <ul className="space-y-1">
            {dashboard.urgent_actions.map((a: string, i: number) => (
              <li key={i} className="text-sm text-red-200">
                &#9888; {a}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
