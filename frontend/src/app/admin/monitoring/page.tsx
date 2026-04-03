"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface HealthChecks {
  db: boolean;
  redis: boolean;
  elasticsearch: boolean;
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

interface CostByAgent {
  agent: string;
  cost: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
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
  const [costByAgent, setCostByAgent] = useState<CostByAgent[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<
    { time: string; latency: number }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      const [h, m] = await Promise.all([
        fetchJSON<HealthData>(`${API_BASE}/api/v1/health/ready`),
        fetchJSON<MetricsData>(`${API_BASE}/api/v1/metrics/`),
      ]);

      setHealth(h);
      setMetrics(m);

      // Simulated cost-by-agent breakdown (would come from a real endpoint)
      if (m) {
        setCostByAgent([
          { agent: "Concierge", cost: m.ai_cost_total * 0.4 },
          { agent: "Portfolio", cost: m.ai_cost_total * 0.25 },
          { agent: "Research", cost: m.ai_cost_total * 0.2 },
          { agent: "Compliance", cost: m.ai_cost_total * 0.15 },
        ]);

        setLatencyHistory((prev) => [
          ...prev.slice(-29),
          {
            time: new Date().toLocaleTimeString(),
            latency: m.avg_latency_ms,
          },
        ]);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Monitoring Dashboard</h1>

      {/* Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            System Status
          </h2>
          <p
            className={`text-2xl font-bold ${
              health?.status === "ready" ? "text-green-400" : "text-yellow-400"
            }`}
          >
            {health?.status ?? "Loading..."}
          </p>
        </div>

        {health?.checks &&
          Object.entries(health.checks).map(([service, ok]) => (
            <div
              key={service}
              className="bg-gray-900 rounded-lg p-6 border border-gray-800"
            >
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                {service}
              </h2>
              <div className="flex items-center gap-2">
                <StatusBadge ok={ok} />
                <span className="text-lg font-semibold">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Cost by Agent */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">AI Cost by Agent</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costByAgent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="agent" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, "Cost"]}
              />
              <Bar dataKey="cost" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Over Time */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">Latency (ms)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                }}
                formatter={(value: number) => [`${value.toFixed(2)} ms`, "Latency"]}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
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
      className={`bg-gray-900 rounded-lg p-6 border ${
        alert ? "border-red-600" : "border-gray-800"
      }`}
    >
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </h2>
      <p className={`text-2xl font-bold ${alert ? "text-red-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}
