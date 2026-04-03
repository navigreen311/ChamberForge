"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import NextActionCard from "@/components/modules/NextActionCard";
import AgentStatusGrid from "@/components/modules/AgentStatusGrid";
import DailyBriefPanel from "@/components/modules/DailyBriefPanel";
import OpportunityRanker from "@/components/modules/OpportunityRanker";
import MetricCard from "@/components/modules/MetricCard";

interface DashboardData {
  nextAction: any;
  dashboard: any;
  opportunities: any[];
  dailyBrief: any;
  agentStatus: Record<string, string>;
  agentDetails?: Record<string, { status: string; last_output?: string }>;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

function SkeletonGrid() {
  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-40 w-full mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Skeleton className="lg:col-span-2 h-48" />
        <Skeleton className="h-48" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [nextActionRes, dashboardRes, opportunitiesRes, dailyBriefRes, agentStatusRes] =
        await Promise.all([
          api.get("/api/v1/command/next-action"),
          api.get("/api/v1/command/dashboard"),
          api.get("/api/v1/command/opportunities"),
          api.get("/api/v1/command/daily-brief"),
          api.get("/api/v1/command/agent-status"),
        ]);

      setData({
        nextAction: nextActionRes.data,
        dashboard: dashboardRes.data,
        opportunities: opportunitiesRes.data?.opportunities ?? opportunitiesRes.data ?? [],
        dailyBrief: dailyBriefRes.data,
        agentStatus: agentStatusRes.data?.statuses ?? agentStatusRes.data ?? {},
        agentDetails: agentStatusRes.data?.details,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading && !data) {
    return <SkeletonGrid />;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-red-400 mb-2">Failed to Load Dashboard</h2>
            <p className="text-chamber-300 mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchAll();
              }}
              className="px-5 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = data?.dashboard?.metrics ?? [];
  const clientHealth = data?.dashboard?.client_health ?? [];

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">
            Command Dashboard
          </h1>
          <p className="text-chamber-400">
            Your AI-powered operating view &mdash;{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchAll();
          }}
          className="flex items-center gap-2 px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-gold-400 hover:text-gold-400 transition text-sm"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error banner (non-blocking when we have stale data) */}
      {error && data && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 flex items-center justify-between">
          <p className="text-red-300 text-sm">
            Failed to refresh: {error}. Showing last known data.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchAll();
            }}
            className="text-sm text-red-300 underline hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Next Action Card */}
      <div className="mb-8">
        <NextActionCard action={data?.nextAction ?? null} />
      </div>

      {/* Metrics Row */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((m: any, i: number) => (
            <MetricCard
              key={m.label ?? i}
              label={m.label}
              value={m.value}
              trend={m.trend ?? "flat"}
              sparkline={m.sparkline}
            />
          ))}
        </div>
      )}

      {/* Agent Grid + Daily Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <AgentStatusGrid statuses={data?.agentStatus ?? {}} details={data?.agentDetails} />
        </div>
        <div>
          <DailyBriefPanel brief={data?.dailyBrief ?? null} />
        </div>
      </div>

      {/* Opportunities */}
      <OpportunityRanker opportunities={data?.opportunities ?? []} />
    </div>
  );
}
