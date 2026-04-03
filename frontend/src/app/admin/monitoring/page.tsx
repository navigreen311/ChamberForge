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

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${
        ok ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hRes, mRes] = await Promise.allSettled([
          api.get("/api/v1/health/ready"),
          api.get("/api/v1/metrics"),
        ]);

        if (hRes.status === "fulfilled") setHealth(hRes.value.data);
        if (mRes.status === "fulfilled") setMetrics(mRes.value.data);

        if (hRes.status === "rejected" && mRes.status === "rejected") {
          setError("Failed to load monitoring data");
        }
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
      <h1 className="text-3xl font-bold mb-8 text-white">Monitoring Dashboard</h1>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 mb-6">{error}</div>
      )}

      {/* Health Status */}
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

      {/* AI Calls */}
      {metrics && (
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
