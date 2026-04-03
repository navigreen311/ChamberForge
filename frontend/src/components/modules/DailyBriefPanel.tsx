"use client";

import { useState } from "react";

interface DailyBrief {
  date: string;
  changes_since_yesterday: string[];
  alerts: string[];
  recommended_actions: { action: string; priority: string; reason: string }[];
  metrics_snapshot: Record<string, number | string>;
}

const priorityBadge: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300",
  high: "bg-orange-500/20 text-orange-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  low: "bg-green-500/20 text-green-300",
};

export default function DailyBriefPanel({
  brief,
}: {
  brief: DailyBrief | null;
}) {
  const [open, setOpen] = useState(true);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  if (!brief) {
    return null;
  }

  const toggleAction = (index: number) => {
    setCheckedActions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="rounded-xl border border-chamber-700 bg-chamber-900 overflow-hidden">
      {/* Header -- click to collapse */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-chamber-800 transition"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-chamber-400">
          Daily Brief &mdash; {brief.date}
        </h3>
        <span className="text-chamber-500">{open ? "\u25B2" : "\u25BC"}</span>
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4">
          {/* Changes */}
          {brief.changes_since_yesterday.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-chamber-300 mb-1">
                Changes Since Yesterday
              </h4>
              <ul className="space-y-0.5">
                {brief.changes_since_yesterday.map((c, i) => (
                  <li key={i} className="text-sm text-chamber-200">
                    &bull; {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Alerts */}
          {brief.alerts.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-red-400 mb-1">
                Alerts
              </h4>
              <ul className="space-y-0.5">
                {brief.alerts.map((a, i) => (
                  <li key={i} className="text-sm text-red-200">
                    &#9888; {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recommended Actions with checkboxes */}
          {brief.recommended_actions.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold text-chamber-300 mb-1">
                Recommended Actions
              </h4>
              <ul className="space-y-1.5">
                {brief.recommended_actions.map((ra, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-chamber-200"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedActions[i]}
                      onChange={() => toggleAction(i)}
                      className="mt-0.5 rounded border-chamber-600 accent-gold-400"
                    />
                    <div className={checkedActions[i] ? "line-through opacity-50" : ""}>
                      <span className="font-medium text-white">
                        {ra.action}
                      </span>
                      <span
                        className={`ml-2 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${priorityBadge[ra.priority] ?? "text-chamber-400"}`}
                      >
                        {ra.priority}
                      </span>
                      <p className="text-xs text-chamber-400">{ra.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
