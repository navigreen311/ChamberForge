"use client";

import { useState, useEffect } from "react";

const systemHealth = [
  { service: "API Gateway", status: "healthy", uptime: "99.98%", latency: "42ms" },
  { service: "Database Cluster", status: "healthy", uptime: "99.99%", latency: "8ms" },
  { service: "AI Agent Runtime", status: "healthy", uptime: "99.95%", latency: "320ms" },
  { service: "Background Jobs", status: "degraded", uptime: "99.80%", latency: "150ms" },
  { service: "Search Index", status: "healthy", uptime: "99.97%", latency: "25ms" },
  { service: "File Storage", status: "healthy", uptime: "100%", latency: "65ms" },
];

const recentJobs = [
  { name: "Evidence Scan — Aviation Market", status: "completed", duration: "3m 42s", time: "8 min ago" },
  { name: "Client Health Recalculation", status: "completed", duration: "1m 15s", time: "22 min ago" },
  { name: "Consent Expiry Check", status: "completed", duration: "0m 28s", time: "1 hour ago" },
  { name: "Revenue Projection Update", status: "running", duration: "2m 10s", time: "In progress" },
  { name: "Compliance Audit Digest", status: "queued", duration: "—", time: "Scheduled 10:00 AM" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
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

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Admin Dashboard</h1>
      <p className="text-chamber-400 mb-8">System health, user management, AI costs, and background jobs</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["System Health", "5/6 Healthy", "text-green-400"],
          ["Active Users", "12", "text-blue-400"],
          ["AI Cost (MTD)", "$2,847", "text-gold-400"],
          ["Jobs (24h)", "147 completed", "text-white"],
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
                  <div className={`w-2.5 h-2.5 rounded-full ${s.status === "healthy" ? "bg-green-400" : "bg-gold-400 animate-pulse"}`} />
                  <span className="text-white text-sm">{s.service}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-chamber-400">
                  <span>{s.uptime}</span>
                  <span>{s.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {recentJobs.map((j) => (
              <div key={j.name} className="flex items-center justify-between p-3 bg-chamber-800/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">{j.name}</p>
                  <p className="text-xs text-chamber-500">{j.duration} &middot; {j.time}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  j.status === "completed" ? "bg-green-400/20 text-green-400" :
                  j.status === "running" ? "bg-blue-400/20 text-blue-400" :
                  "bg-chamber-700 text-chamber-400"
                }`}>{j.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["AI Eval Lab", "/admin/eval-lab"],
          ["Entitlements", "/admin/entitlements"],
          ["Rules Builder", "/admin/rules"],
          ["AI Runtime", "/admin/runtime"],
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
