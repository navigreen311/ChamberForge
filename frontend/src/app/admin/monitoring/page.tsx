"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface HealthChecks {
  [key: string]: boolean;
}

interface HealthData {
  status: string;
  checks: HealthChecks;
}

interface MetricsData {
  requests_total: number;
  avg_latency_ms: number;
  error_count: number;
  ai_calls_total: number;
  ai_cost_total: number;
}

interface DependencyHealth {
  name: string;
  status: string;
  latency_ms: number;
  error?: string;
}

interface DetailedMetrics {
  performance: {
    requests_total: number;
    avg_latency_ms: number;
    error_count: number;
  };
  ai_usage: {
    calls_total: number;
    cost_total: number;
    calls_24h: number;
    cost_24h: number;
  };
  db_pool: {
    pool_size: number;
    checked_in: number;
    checked_out: number;
    overflow: number;
  };
  redis: {
    connected: boolean;
    used_memory_mb: number;
    used_memory_peak_mb: number;
    connected_clients: number;
  };
  elasticsearch: {
    cluster_status: string;
    number_of_nodes: number;
    active_shards: number;
    total_documents: number;
  };
  celery: {
    worker_count: number;
    active_tasks: number;
  };
  entities: {
    workspaces: number;
    users: number;
    problems: number;
    daily_active_users: number;
  };
  health: {
    overall: string;
    dependencies: { [key: string]: DependencyHealth };
  };
  alerts: Array<{
    severity: string;
    type: string;
    message: string;
  }>;
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${
        ok ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );
}

function LatencyBadge({ ms }: { ms: number }) {
  const color = ms < 50 ? "text-green-400" : ms < 200 ? "text-yellow-400" : "text-red-400";
  return <span className={`text-xs ${color}`}>{ms}ms</span>;
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [detailed, setDetailed] = useState<DetailedMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hRes, mRes, dRes] = await Promise.allSettled([
          api.get("/api/v1/health/ready"),
          api.get("/api/v1/metrics"),
          api.get("/api/v1/metrics/detailed"),
        ]);

        if (hRes.status === "fulfilled") setHealth(hRes.value.data);
        if (mRes.status === "fulfilled") setMetrics(mRes.value.data);
        if (dRes.status === "fulfilled") setDetailed(dRes.value.data);

        if (hRes.status === "rejected" && mRes.status === "rejected") {
          setError("Failed to load monitoring data");
        }
        setLastRefresh(new Date());
      } catch (err: any) {
        setError(err?.message || "Failed to load monitoring data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 text-chamber-100 p-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Monitoring Dashboard</h1>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-chamber-800 rounded-lg h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 text-chamber-100 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Monitoring Dashboard</h1>
        <span className="text-xs text-chamber-500">
          Last refresh: {lastRefresh.toLocaleTimeString()} (auto-refresh 15s)
        </span>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 mb-6">{error}</div>
      )}

      {/* Alerts Panel */}
      {detailed && detailed.alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-white">Active Alerts</h2>
          <div className="space-y-2">
            {detailed.alerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 border ${
                  alert.severity === "critical"
                    ? "bg-red-400/10 border-red-400/30 text-red-400"
                    : "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                }`}
              >
                <span className="font-semibold uppercase text-xs mr-2">{alert.severity}</span>
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Health Panel */}
      {detailed?.health && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-white">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-chamber-900 rounded-lg p-6 border border-chamber-800">
              <h3 className="text-sm font-medium text-chamber-400 uppercase tracking-wider mb-2">Overall</h3>
              <p className={`text-2xl font-bold ${
                detailed.health.overall === "healthy" ? "text-green-400" : "text-yellow-400"
              }`}>
                {detailed.health.overall}
              </p>
            </div>
            {Object.values(detailed.health.dependencies).map((dep) => (
              <div key={dep.name} className="bg-chamber-900 rounded-lg p-6 border border-chamber-800">
                <h3 className="text-sm font-medium text-chamber-400 uppercase tracking-wider mb-2">{dep.name}</h3>
                <div className="flex items-center gap-2">
                  <StatusBadge ok={dep.status === "healthy"} />
                  <span className="text-lg font-semibold text-white">
                    {dep.status === "healthy" ? "OK" : "Down"}
                  </span>
                </div>
                <LatencyBadge ms={dep.latency_ms} />
                {dep.error && <p className="text-xs text-red-400 mt-1 truncate">{dep.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: basic health status if detailed not available */}
      {!detailed?.health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-chamber-900 rounded-lg p-6 border border-chamber-800">
            <h2 className="text-sm font-medium text-chamber-400 uppercase tracking-wider mb-2">
              System Status
            </h2>
            <p
              className={`text-2xl font-bold ${
                health?.status === "ready" ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {health?.status ?? "Unknown"}
            </p>
          </div>

          {health?.checks &&
            Object.entries(health.checks).map(([service, ok]) => (
              <div
                key={service}
                className="bg-chamber-900 rounded-lg p-6 border border-chamber-800"
              >
                <h2 className="text-sm font-medium text-chamber-400 uppercase tracking-wider mb-2">
                  {service}
                </h2>
                <div className="flex items-center gap-2">
                  <StatusBadge ok={ok as boolean} />
                  <span className="text-lg font-semibold text-white">
                    {ok ? "Connected" : "Down"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Requests"
          value={metrics?.requests_total?.toLocaleString() ?? "--"}
        />
        <MetricCard
          label="Avg Latency"
          value={metrics ? `${metrics.avg_latency_ms} ms` : "--"}
        />
        <MetricCard
          label="Error Count"
          value={metrics?.error_count?.toLocaleString() ?? "--"}
          alert={!!metrics && metrics.error_count > 0}
        />
        <MetricCard
          label="AI Cost (Total)"
          value={metrics ? `$${metrics.ai_cost_total.toFixed(4)}` : "--"}
        />
      </div>

      {/* Operational Metrics */}
      {detailed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Entity Counts */}
          <div className="bg-chamber-900 rounded-lg p-6 border border-chamber-800">
            <h2 className="text-lg font-semibold mb-4 text-white">Entity Counts</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">Workspaces</p>
                <p className="text-2xl font-bold text-white">{detailed.entities.workspaces.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">Users</p>
                <p className="text-2xl font-bold text-white">{detailed.entities.users.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">Problems</p>
                <p className="text-2xl font-bold text-white">{detailed.entities.problems.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">Daily Active Users</p>
                <p className="text-2xl font-bold text-gold-400">{detailed.entities.daily_active_users.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Infrastructure Stats */}
          <div className="bg-chamber-900 rounded-lg p-6 border border-chamber-800">
            <h2 className="text-lg font-semibold mb-4 text-white">Infrastructure</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">DB Pool (active/idle)</p>
                <p className="text-2xl font-bold text-white">
                  {detailed.db_pool.checked_out}/{detailed.db_pool.checked_in}
                </p>
              </div>
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">Redis Memory</p>
                <p className="text-2xl font-bold text-white">
                  {detailed.redis.connected ? `${detailed.redis.used_memory_mb} MB` : "N/A"}
                </p>
              </div>
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">ES Documents</p>
                <p className="text-2xl font-bold text-white">{detailed.elasticsearch.total_documents.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-chamber-800/50 rounded-lg">
                <p className="text-chamber-400 text-sm">Celery Workers</p>
                <p className="text-2xl font-bold text-white">
                  {detailed.celery.worker_count} ({detailed.celery.active_tasks} active)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Usage */}
      {detailed && (
        <div className="bg-chamber-900 rounded-lg p-6 border border-chamber-800 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">AI Usage Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-chamber-800/50 rounded-lg">
              <p className="text-chamber-400 text-sm">Total AI Calls</p>
              <p className="text-2xl font-bold text-white">{detailed.ai_usage.calls_total.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-chamber-800/50 rounded-lg">
              <p className="text-chamber-400 text-sm">Total AI Cost</p>
              <p className="text-2xl font-bold text-gold-400">${detailed.ai_usage.cost_total.toFixed(4)}</p>
            </div>
            <div className="p-4 bg-chamber-800/50 rounded-lg">
              <p className="text-chamber-400 text-sm">AI Calls (24h)</p>
              <p className="text-2xl font-bold text-white">{detailed.ai_usage.calls_24h.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-chamber-800/50 rounded-lg">
              <p className="text-chamber-400 text-sm">AI Cost (24h)</p>
              <p className="text-2xl font-bold text-gold-400">${detailed.ai_usage.cost_24h.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fallback AI usage if no detailed metrics */}
      {!detailed && metrics && (
        <div className="bg-chamber-900 rounded-lg p-6 border border-chamber-800">
          <h2 className="text-lg font-semibold mb-4 text-white">AI Usage Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-chamber-800/50 rounded-lg">
              <p className="text-chamber-400 text-sm">Total AI Calls</p>
              <p className="text-2xl font-bold text-white">{metrics.ai_calls_total.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-chamber-800/50 rounded-lg">
              <p className="text-chamber-400 text-sm">Cost per AI Call</p>
              <p className="text-2xl font-bold text-gold-400">
                {metrics.ai_calls_total > 0
                  ? `$${(metrics.ai_cost_total / metrics.ai_calls_total).toFixed(4)}`
                  : "--"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-chamber-900 rounded-lg p-6 border ${
        alert ? "border-red-600" : "border-chamber-800"
      }`}
    >
      <h2 className="text-sm font-medium text-chamber-400 uppercase tracking-wider mb-2">
        {label}
      </h2>
      <p className={`text-2xl font-bold ${alert ? "text-red-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
