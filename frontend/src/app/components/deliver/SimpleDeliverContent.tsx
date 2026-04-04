'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  Inline data                                                        */
/* ------------------------------------------------------------------ */

type DeliverStatus =
  | 'Done and sent'
  | 'Working on it'
  | "Checking it's right"
  | 'LATE — act now';

interface DeliverableRow {
  id: string;
  what: string;
  forWho: string;
  due: string;
  status: DeliverStatus;
  action: string;
}

const STATUS_STYLES: Record<DeliverStatus, string> = {
  'Done and sent': 'bg-emerald-500/20 text-emerald-400',
  'Working on it': 'bg-blue-500/20 text-blue-400',
  "Checking it's right": 'bg-yellow-500/20 text-yellow-400',
  'LATE — act now': 'bg-red-500/20 text-red-400',
};

const STATUS_DOT: Record<DeliverStatus, string> = {
  'Done and sent': 'bg-emerald-400',
  'Working on it': 'bg-blue-400',
  "Checking it's right": 'bg-yellow-400',
  'LATE — act now': 'bg-red-400',
};

const DELIVERABLES: DeliverableRow[] = [
  {
    id: '1',
    what: 'Monthly security report',
    forWho: 'Sarah Chen',
    due: 'Apr 1',
    status: 'Done and sent',
    action: 'No action needed — delivered on time',
  },
  {
    id: '2',
    what: 'Cybersecurity training plan',
    forWho: 'Wellington Trust',
    due: 'Apr 4',
    status: 'LATE — act now',
    action: 'Finish and send today — it was due yesterday',
  },
  {
    id: '3',
    what: 'Estate coordination update',
    forWho: 'Harrington Dynasty',
    due: 'Apr 7',
    status: 'Working on it',
    action: 'On track — keep going',
  },
  {
    id: '4',
    what: 'Digital footprint audit',
    forWho: 'Marcus Reid',
    due: 'Apr 10',
    status: "Checking it's right",
    action: 'QA review in progress — check back tomorrow',
  },
  {
    id: '5',
    what: 'Handoff documentation',
    forWho: 'Thornton',
    due: 'Apr 12',
    status: 'LATE — act now',
    action: 'Client is waiting — prioritize this today',
  },
];

interface TodoItem {
  date: string;
  description: string;
  urgent: boolean;
}

const TODOS: TodoItem[] = [
  {
    date: 'Tomorrow at 10 AM',
    description: 'Weekly check-in call with Sarah Chen',
    urgent: false,
  },
  {
    date: 'Apr 5',
    description:
      "Deliver cybersecurity training to Wellington Trust (it's 1 day late)",
    urgent: true,
  },
];

interface PortalInfo {
  client: string;
  description: string;
  lastVisited: string;
}

const PORTALS: PortalInfo[] = [
  {
    client: 'Sarah Chen',
    description:
      "Sarah Chen's private website — she can see her results here.",
    lastVisited: 'Last visited 2 days ago',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SimpleDeliverContent() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-white">Getting things done</h1>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="On-time delivery" value="88%" color="emerald" />
        <KPICard label="Late (needs attention)" value="2" color="red" />
        <KPICard label="Quality score" value="82%" color="yellow" />
        <KPICard label="New clients getting started" value="1" color="blue" />
      </div>

      {/* Deliverables table */}
      <div className="overflow-x-auto rounded-lg border border-[#1e2a3a]">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-[#1e2a3a] text-[10px] uppercase tracking-wider text-gray-500">
              <th className="p-3">What I&apos;m delivering</th>
              <th className="p-3">For who</th>
              <th className="p-3">When it&apos;s due</th>
              <th className="p-3">How I&apos;m going</th>
              <th className="p-3">What to do</th>
            </tr>
          </thead>
          <tbody>
            {DELIVERABLES.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[#1e2a3a] hover:bg-[#111827] transition-colors"
              >
                <td className="p-3 font-medium text-white">{row.what}</td>
                <td className="p-3 text-gray-300">{row.forWho}</td>
                <td className="p-3 text-gray-300 text-xs">{row.due}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${STATUS_DOT[row.status]}`}
                    />
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </span>
                  </span>
                </td>
                <td className="p-3 text-gray-300 text-xs">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* To-do list */}
      <div>
        <h2 className="text-lg font-medium text-white mb-3">
          Coming up next
        </h2>
        <div className="space-y-2">
          {TODOS.map((todo, i) => (
            <div
              key={i}
              className={`
                flex items-start gap-3 rounded-lg border p-3
                ${
                  todo.urgent
                    ? 'border-red-500/30 bg-red-500/10'
                    : 'border-[#1e2a3a] bg-[#0d1117]'
                }
              `}
            >
              <span
                className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  todo.urgent ? 'bg-red-400' : 'bg-emerald-400'
                }`}
              />
              <div>
                <span
                  className={`text-xs font-semibold ${
                    todo.urgent ? 'text-red-300' : 'text-[#C9A84C]'
                  }`}
                >
                  {todo.date}
                </span>
                <p className="text-sm text-gray-200">{todo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client portals */}
      <div>
        <h2 className="text-lg font-medium text-white mb-3">
          Client portals
        </h2>
        <div className="space-y-2">
          {PORTALS.map((portal, i) => (
            <div
              key={i}
              className="rounded-lg border border-[#1e2a3a] bg-[#0d1117] p-4"
            >
              <p className="text-sm text-gray-200">{portal.description}</p>
              <p className="text-xs text-gray-500 mt-1">{portal.lastVisited}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI card                                                           */
/* ------------------------------------------------------------------ */

function KPICard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'emerald' | 'red' | 'yellow' | 'blue';
}) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 border-emerald-500/30',
    red: 'text-red-400 border-red-500/30',
    yellow: 'text-yellow-400 border-yellow-500/30',
    blue: 'text-blue-400 border-blue-500/30',
  };

  return (
    <div
      className={`rounded-lg border bg-[#0d1117] p-4 ${colorMap[color]}`}
    >
      <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorMap[color].split(' ')[0]}`}>
        {value}
      </p>
    </div>
  );
}
