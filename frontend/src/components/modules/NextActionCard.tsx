"use client";

import { useState } from "react";

interface NextAction {
  action_title: string;
  action_description: string;
  why: string;
  evidence_links: string[];
  confidence: number;
  priority: "critical" | "high" | "medium" | "low";
  estimated_impact: string;
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300",
  high: "bg-orange-500/20 text-orange-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  low: "bg-green-500/20 text-green-300",
};

export default function NextActionCard({ action }: { action: NextAction | null }) {
  const [dismissed, setDismissed] = useState(false);

  if (!action || dismissed) {
    return (
      <div className="rounded-xl border-2 border-gold-400/30 bg-chamber-900 p-6 text-center text-chamber-400">
        No pending actions
      </div>
    );
  }

  const confidencePct = Math.round(action.confidence * 100);

  return (
    <div className="rounded-xl border-2 border-gold-400 bg-gradient-to-br from-chamber-900 to-chamber-800 p-6 shadow-lg shadow-gold-400/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${priorityColors[action.priority]}`}
          >
            {action.priority}
          </span>
          <h2 className="mt-2 text-xl font-display font-bold text-white">
            {action.action_title}
          </h2>
        </div>
        <div className="shrink-0 rounded-lg bg-gold-400/10 px-3 py-1 text-sm font-semibold text-gold-400">
          {confidencePct}% confidence
        </div>
      </div>

      {/* Body */}
      <p className="mt-3 text-chamber-200">{action.action_description}</p>
      <p className="mt-2 text-sm text-chamber-400">
        <span className="font-semibold text-chamber-300">Why:</span> {action.why}
      </p>

      {/* Evidence */}
      {action.evidence_links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {action.evidence_links.map((link, i) => (
            <a
              key={i}
              href={link}
              className="rounded bg-chamber-700 px-2 py-0.5 text-xs text-gold-300 hover:bg-chamber-600 transition"
            >
              {link}
            </a>
          ))}
        </div>
      )}

      {/* Impact */}
      <p className="mt-3 text-sm font-semibold text-gold-300">
        Estimated impact: {action.estimated_impact}
      </p>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-chamber-950 hover:bg-gold-400 transition">
          Execute
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg border border-chamber-600 px-5 py-2 text-sm font-semibold text-chamber-300 hover:bg-chamber-800 transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
