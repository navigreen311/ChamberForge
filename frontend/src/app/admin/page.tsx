"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface ServiceStatus {
  service: string;
  status: string;
  uptime?: string;
  latency?: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [jobs, setJobs] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [healthRes, metricsRes, jobsRes] = await Promise.allSettled([
          api.get("/api/v1/health/ready"),
          api.get("/api/v1/metrics"),
          api.get("/api/v1/jobs/status"),
        ]);

        if (healthRes.status === "fulfilled") {
          const h = healthRes.value.data;
          const services: ServiceStatus[] = [];
          if (h.checks) {
            Object.entries(h.checks).forEach(([name, ok]) => {
              services.push({ service: name, status: ok ? "healthy" : "down" });
            });
          }
          services.push({ service: "API", status: h.status === "ready" ? "healthy" : "degraded" });
          setSystemHealth(services);
        }

        if (metricsRes.status === "fulfilled") {
          setMetrics(metricsRes.value.data);
        }

        if (jobsRes.status === "fulfilled") {
          setJobs(jobsRes.value.data);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <h1 className="text-3xl font-display font-bold text-white mb-4">Admin Dashboard</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  const healthyCount = systemHealth.filter((s) => s.status === "healthy").length;
  const totalServices = systemHealth.length;
  const aiCost = metrics?.ai_cost_total != null ? `$${Number(metrics.ai_cost_total).toFixed(2)}` : "--";
  const totalRequests = metrics?.requests_total?.toLocaleString() ?? "--";
  const activeJobs = jobs?.active ? Object.values(jobs.active).flat().length : 0;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Admin Dashboard</h1>
      <p className="text-chamber-400 mb-8">System health, user management, AI costs, and background jobs</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["System Health", `${healthyCount}/${totalServices} Healthy`, healthyCount === totalServices ? "text-green-400" : "text-gold-400"],
          ["Total Requests", totalRequests, "text-blue-400"],
          ["AI Cost (Total)", aiCost, "text-gold-400"],
          ["Active Jobs", activeJobs.toString(), "text-white"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* System Health */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
          <div className="space-y-3">
            {systemHealth.map((s) => (
              <div key={s.service} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.status === "healthy" ? "bg-green-400" : s.status === "degraded" ? "bg-gold-400 animate-pulse" : "bg-red-400"}`} />
                  <span className="text-white text-sm capitalize">{s.service}</span>
                </div>
                <span className={`text-xs ${s.status === "healthy" ? "text-green-400" : s.status === "degraded" ? "text-gold-400" : "text-red-400"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Summary */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Metrics Overview</h3>
          {metrics ? (
            <div className="space-y-3">
              {[
                ["Total Requests", metrics.requests_total?.toLocaleString() ?? "--"],
                ["Avg Latency", metrics.avg_latency_ms != null ? `${metrics.avg_latency_ms} ms` : "--"],
                ["Error Count", metrics.error_count?.toLocaleString() ?? "--"],
                ["AI Calls", metrics.ai_calls_total?.toLocaleString() ?? "--"],
                ["AI Cost", metrics.ai_cost_total != null ? `$${Number(metrics.ai_cost_total).toFixed(4)}` : "--"],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                  <span className="text-chamber-300 text-sm">{String(label)}</span>
                  <span className="text-white font-medium text-sm">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-chamber-500 text-sm">Metrics unavailable.</p>
          )}
        </div>
      </div>

      {/* Admin Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["AI Eval Lab", "/admin/eval-lab"],
          ["Entitlements", "/admin/entitlements"],
          ["Rules Builder", "/admin/rules"],
          ["AI Runtime", "/admin/runtime"],
          ["Monitoring", "/admin/monitoring"],
          ["Background Jobs", "/admin/jobs"],
          ["Email Dashboard", "/admin/email"],
          ["Documents", "/admin/documents"],
          ["Records Retention", "/admin/records"],
          ["Database Backups", "/admin/backups"],
        ].map(([name, href]) => (
          <a key={String(name)} href={String(href)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition text-center">
            <p className="text-white font-medium">{String(name)}</p>
            <p className="text-xs text-chamber-500 mt-1">Manage &rarr;</p>
          </a>
        ))}
      </div>
    </div>
  );
}
