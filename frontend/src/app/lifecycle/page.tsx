"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Meeting {
  client: string;
  type: string;
  date: string;
  time: string;
}

interface HealthAlert {
  client: string;
  client_id: string;
  health: number;
  alert: string;
  severity: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function LifecyclePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meetingsRes, healthRes] = await Promise.all([
          api.get("/api/v1/lifecycle/meetings"),
          api.get("/api/v1/lifecycle/health/alerts"),
        ]);
        setMeetings(meetingsRes.data);
        setAlerts(healthRes.data);
      } catch (err: any) {
        setError(err?.message || "Failed to load lifecycle data");
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
        <div className="grid grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <h1 className="text-3xl font-display font-bold text-white mb-4">Lifecycle Hub</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Lifecycle Hub</h1>
      <p className="text-chamber-400 mb-8">Client meetings, health monitoring, and team training</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Meetings */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Meetings</h3>
          {meetings.length === 0 ? (
            <p className="text-chamber-500 text-sm">No upcoming meetings.</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((m, i) => (
                <div key={i} className="p-3 bg-chamber-800/50 rounded-lg">
                  <p className="text-white font-medium text-sm">{m.client}</p>
                  <p className="text-xs text-chamber-500">{m.type}</p>
                  <p className="text-xs text-gold-400 mt-1">{m.date} at {m.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Health Alerts */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Health Alerts</h3>
            <a href="/lifecycle/health" className="text-gold-400 text-sm hover:underline">View all &rarr;</a>
          </div>
          {alerts.length === 0 ? (
            <p className="text-chamber-500 text-sm">No health alerts.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`p-3 rounded-lg border ${a.severity === "critical" ? "border-red-400/30 bg-red-400/5" : "border-gold-400/30 bg-gold-400/5"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium text-sm">{a.client}</p>
                    <span className={`text-sm font-bold ${a.health >= 60 ? "text-gold-400" : "text-red-400"}`}>{a.health}</span>
                  </div>
                  <p className="text-xs text-chamber-400">{a.alert}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Intel Briefs", "/lifecycle/intel-brief/client-001"],
          ["Health Monitor", "/lifecycle/health"],
          ["Scenario Planner", "/lifecycle/scenario"],
          ["Alumni Network", "/lifecycle/alumni"],
          ["Team Trainer", "/lifecycle/trainer"],
          ["Client Retention", "/sell/retention"],
        ].map(([name, href]) => (
          <a key={String(name)} href={String(href)} className="bg-chamber-900 rounded-xl p-4 border border-chamber-800 hover:border-gold-400/50 transition text-center">
            <p className="text-white font-medium">{String(name)}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
