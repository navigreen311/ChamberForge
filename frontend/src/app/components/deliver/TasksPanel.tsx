'use client';

import { CheckCircle, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  overdue: boolean;
  completed: boolean;
  dueLabel?: string;
}

interface TasksPanelProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

const PRIORITY_BORDER: Record<string, string> = {
  Critical: 'border-l-red-500',
  High: 'border-l-orange-500',
  Medium: 'border-l-amber-500',
  Low: 'border-l-gray-500',
};

export default function TasksPanel({ tasks, onComplete }: TasksPanelProps) {
  // Sort overdue to top
  const sorted = [...tasks].sort((a, b) => {
    if (a.overdue && !b.overdue) return -1;
    if (!a.overdue && b.overdue) return 1;
    return 0;
  });

  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Tasks</h3>

      <div className="space-y-2">
        {sorted.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${PRIORITY_BORDER[task.priority]} ${
              task.overdue ? 'bg-red-950/20' : 'bg-[#0d1117]'
            }`}
          >
            <button
              onClick={() => onComplete(task.id)}
              className="shrink-0 cursor-pointer"
            >
              {task.completed ? (
                <CheckCircle size={18} className="text-emerald-400" />
              ) : (
                <Circle size={18} className="text-gray-600 hover:text-gray-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                {task.title}
              </p>
              {task.dueLabel && (
                <p className={`text-[10px] mt-0.5 ${task.overdue ? 'text-red-400' : 'text-gray-500'}`}>
                  {task.dueLabel}
                </p>
              )}
            </div>

            {task.overdue && !task.completed && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/50 text-red-400">
                Overdue
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
