"use client";

import { useState, useEffect, useCallback } from "react";
import { JobMonitor } from "@/components/modules/JobMonitor";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminJobsPage() {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/jobs/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: JobStatus = await res.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch job status");
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
      const res = await fetch(`${API_BASE}/api/v1/jobs/trigger/${taskName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ args: ["all"], kwargs: {} }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTriggerResult(`Task "${taskName}" queued with ID: ${data.task_id}`);
      setTimeout(() => setTriggerResult(null), 5000);
      fetchStatus();
    } catch (err) {
      setTriggerResult(
        `Failed to trigger "${taskName}": ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  const activeTasks = status
    ? Object.values(status.active).flat()
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Background Jobs Dashboard
          </h1>
          <button
            onClick={fetchStatus}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {triggerResult && (
          <div className="mb-6 rounded-md bg-blue-50 p-4 text-blue-800">
            {triggerResult}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Active Tasks */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Active Tasks ({activeTasks.length})
              </h2>
              {activeTasks.length === 0 ? (
                <p className="text-gray-500">No active tasks.</p>
              ) : (
                <JobMonitor tasks={activeTasks} />
              )}
            </section>

            {/* Beat Schedule */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Scheduled Tasks (Beat)
              </h2>
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Schedule
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {status?.beat_schedule.map((entry) => (
                      <tr key={entry.name}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {entry.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {entry.task}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {entry.schedule}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Manual Trigger */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Manual Trigger
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {TRIGGERABLE_TASKS.map((task) => (
                  <button
                    key={task}
                    onClick={() => triggerTask(task)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
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
