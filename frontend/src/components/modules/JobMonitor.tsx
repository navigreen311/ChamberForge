"use client";

import { useMemo } from "react";

type TaskStatus = "PENDING" | "STARTED" | "SUCCESS" | "FAILURE" | "RETRY" | string;

interface TaskInfo {
  id?: string;
  name?: string;
  hostname?: string;
  time_start?: number;
  args?: string;
  kwargs?: string;
  type?: string;
  acknowledged?: boolean;
  [key: string]: unknown;
}

interface JobMonitorProps {
  tasks: TaskInfo[];
}

const STATUS_STYLES: Record<TaskStatus, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-800", dot: "bg-yellow-400" },
  STARTED: { bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-400" },
  SUCCESS: { bg: "bg-green-50", text: "text-green-800", dot: "bg-green-400" },
  FAILURE: { bg: "bg-red-50", text: "text-red-800", dot: "bg-red-400" },
  RETRY: { bg: "bg-orange-50", text: "text-orange-800", dot: "bg-orange-400" },
};

function getStatusStyle(status: TaskStatus) {
  return STATUS_STYLES[status] ?? { bg: "bg-gray-50", text: "text-gray-800", dot: "bg-gray-400" };
}

function formatElapsed(startTime: number | undefined): string {
  if (!startTime) return "--";
  const elapsed = Math.floor(Date.now() / 1000 - startTime);
  if (elapsed < 60) return `${elapsed}s`;
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export function JobMonitor({ tasks }: JobMonitorProps) {
  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => (b.time_start ?? 0) - (a.time_start ?? 0)),
    [tasks]
  );

  if (sortedTasks.length === 0) {
    return <p className="text-gray-500">No tasks to display.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <ul className="divide-y divide-gray-200">
        {sortedTasks.map((task, idx) => {
          const status: TaskStatus = task.acknowledged ? "STARTED" : "PENDING";
          const style = getStatusStyle(status);

          return (
            <li key={task.id ?? idx} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${style.dot}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {task.name ?? task.type ?? "Unknown task"}
                    </p>
                    {task.id && (
                      <p className="text-xs text-gray-400 font-mono">{task.id}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                  >
                    {status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatElapsed(task.time_start)}
                  </span>
                </div>
              </div>
              {(task.args || task.kwargs) && (
                <div className="mt-1 text-xs text-gray-400 font-mono truncate">
                  args={task.args ?? "[]"} kwargs={task.kwargs ?? "{}"}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
