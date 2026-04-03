"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Alert {
  id: string;
  priority: string;
  type: string;
  message: string;
}

export default function LifecycleHub() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/lifecycle/mobile/alerts`)
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const modules = [
    { name: "Intel Brief", href: "/lifecycle/intel-brief/demo-client", icon: "🔍", desc: "Pre-meeting intelligence dossiers" },
    { name: "Client Health", href: "/lifecycle/health", icon: "💊", desc: "Health scores & churn detection" },
    { name: "Scenario Planner", href: "/lifecycle/scenario", icon: "📊", desc: "What-if revenue modeling" },
    { name: "Team Training", href: "/lifecycle/trainer", icon: "🎓", desc: "Curriculum & progress tracking" },
    { name: "Alumni Network", href: "/lifecycle/alumni", icon: "🤝", desc: "Post-engagement management" },
  ];

  const priorityColor: Record<string, string> = {
    high: "border-red-500 bg-red-500/10",
    medium: "border-yellow-500 bg-yellow-500/10",
    low: "border-chamber-500 bg-chamber-500/10",
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-2">Client Lifecycle Hub</h1>
      <p className="text-chamber-400 mb-8">9 modules powering the full client journey</p>

      {/* Alert Banner */}
      {!loading && alerts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">Active Alerts</h2>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`border-l-4 rounded-r-lg px-4 py-3 ${priorityColor[a.priority] ?? "border-chamber-600"}`}
              >
                <span className="text-xs uppercase tracking-wider text-chamber-400 mr-2">
                  {a.priority}
                </span>
                <span className="text-white">{a.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Module Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <Link
            key={m.name}
            href={m.href}
            className="group block rounded-xl border border-chamber-700 bg-chamber-900 p-6 hover:border-gold-500 transition-colors"
          >
            <div className="text-3xl mb-3">{m.icon}</div>
            <h3 className="text-xl font-semibold text-white group-hover:text-gold-400 transition-colors">
              {m.name}
            </h3>
            <p className="text-chamber-400 mt-1 text-sm">{m.desc}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
