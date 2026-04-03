"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface BeatEntry {
  name: string;
  task: string;
  schedule: string;
}

interface JobStatus {
  active: Record<string, any[]>;
  scheduled: Record<string, any[]>;
  reserved: Record<string, any[]>;
  beat_schedule: BeatEntry[];
  timestamp: string;
}

const TRIGGERABLE_TASKS = [
  "run_problem_discovery",
  "run_evidence_ingestion",
  "run_offer_generation",
  "run_command_ai_synthesis",
  "refresh_recency_scores",
  "flag_stale_sources",
  "send_weekly_digest",
  "generate_quarterly_scorecard",
  "generate_revenue_report",
  "full_reindex",
];

export default function AdminJobsPage() {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/jobs/status");
      setStatus(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch job status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const triggerTask = async (taskName: string) => {
    try {
      const res = await api.post(`/api/v1/jobs/trigger/${taskName}`, {
        args: ["all"],
        kwargs: {},
      });
      setTriggerResult(`Task "${taskName}" queued with ID: ${res.data.task_id}`);
      setTimeout(() => setTriggerResult(null), 5000);
      fetchStatus();
    } catch (err: any) {
      setTriggerResult(
        `Failed to trigger "${taskName}": ${err?.response?.data?.detail || err?.message || "Unknown error"}`
      );
    }
  };

  const activeTasks = status
    ? Object.values(status.active).flat()
    : [];

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            Background Jobs Dashboard
          </h1>
          <button
            onClick={fetchStatus}
            className="rounded-lg bg-gold-400 px-4 py-2 text-sm font-medium text-chamber-950 hover:bg-gold-300 transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-400/10 border border-red-400/30 p-4 text-red-400">
            {error}
          </div>
        )}

        {triggerResult && (
          <div className={`mb-6 rounded-xl p-4 ${triggerResult.includes("Failed") ? "bg-red-400/10 border border-red-400/30 text-red-400" : "bg-blue-400/10 border border-blue-400/30 text-blue-400"}`}>
            {triggerResult}
          </div>
        )}

        {loading ? (
          <div className="text-center text-chamber-500">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Active Tasks */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Active Tasks ({activeTasks.length})
              </h2>
              {activeTasks.length === 0 ? (
                <p className="text-chamber-500">No active tasks.</p>
              ) : (
                <div className="space-y-2">
                  {activeTasks.map((task, i) => (
                    <div key={i} className="bg-chamber-900 rounded-lg p-4 border border-chamber-800 text-chamber-300 text-sm">
                      {JSON.stringify(task)}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Beat Schedule */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Scheduled Tasks (Beat)
              </h2>
              {status?.beat_schedule && status.beat_schedule.length > 0 ? (
                <div className="overflow-hidden rounded-xl bg-chamber-900 border border-chamber-800">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-chamber-800">
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-chamber-400">Name</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-chamber-400">Task</th>
                        <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-chamber-400">Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {status.beat_schedule.map((entry) => (
                        <tr key={entry.name} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{entry.name}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-chamber-400">{entry.task}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-chamber-400">{entry.schedule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-chamber-500">No scheduled tasks.</p>
              )}
            </section>

            {/* Manual Trigger */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Manual Trigger
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {TRIGGERABLE_TASKS.map((task) => (
                  <button
                    key={task}
                    onClick={() => triggerTask(task)}
                    className="rounded-lg border border-chamber-700 bg-chamber-900 px-4 py-2 text-sm font-medium text-chamber-300 hover:bg-chamber-800 hover:text-white transition"
                  >
                    {task.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
