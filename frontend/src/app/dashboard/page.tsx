"use client";

import { useState, useEffect } from "react";
import { useWorkspaceEvents, useEvent } from "@/hooks/useRealtime";

const WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || null;

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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState(metrics);
  const [liveAgents, setLiveAgents] = useState(agents);

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

  /* ---- Realtime: workspace events ---- */
  const wsChannel = useWorkspaceEvents(WORKSPACE_ID);

  useEvent<typeof metrics>(wsChannel, "dashboard-update", (data) => {
    if (Array.isArray(data)) {
      setLiveMetrics(data);
    }
  });

  useEvent<{ name: string; status: string; task: string }>(
    wsChannel,
    "agent-status-change",
    (data) => {
      setLiveAgents((prev) =>
        prev.map((a) =>
          a.name === data.name ? { ...a, status: data.status, task: data.task } : a
        )
      );
    }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-4 sm:p-8 flex items-center justify-center">
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
    <div className="min-h-screen bg-chamber-950 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {liveMetrics.map((m) => (
          <div key={m.label} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm mb-1">{m.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{m.value}</span>
              <span className={`text-sm ${m.up ? "text-green-400" : "text-red-400"}`}>{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Grid + Daily Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">AI Agent Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {liveAgents.map((a) => (
              <div key={a.name} className="bg-chamber-900 rounded-lg p-4 border border-chamber-800 flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${a.status === "active" ? "bg-green-400 animate-pulse" : "bg-chamber-500"}`} />
                <div>
                  <p className="font-semibold text-white">{a.name}</p>
                  <p className="text-sm text-chamber-400">{a.task}</p>
                </div>
              </div>
            ))}
          </div>
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
