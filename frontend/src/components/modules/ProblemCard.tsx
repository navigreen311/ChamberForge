"use client";

import LifecycleBadge from "./LifecycleBadge";

interface Problem {
  id: string;
  title: string;
  description?: string | null;
  urgency_score?: number | null;
  wealth_tier?: string | null;
  lifecycle_stage?: string | null;
  pain_category?: string | null;
}

function urgencyColor(score: number): string {
  if (score >= 8) return "text-red-400";
  if (score >= 5) return "text-yellow-400";
  return "text-green-400";
}

export default function ProblemCard({ problem }: { problem: Problem }) {
  const urgency = problem.urgency_score ?? 0;

  return (
    <a
      href={`/discover/${problem.id}`}
      className="block rounded-xl border border-chamber-700 bg-chamber-900 p-5 transition hover:border-gold-400/60 hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-white leading-tight">
          {problem.title}
        </h3>
        <span
          className={`shrink-0 text-2xl font-bold tabular-nums ${urgencyColor(urgency)}`}
        >
          {urgency}
        </span>
      </div>

      {/* Description preview */}
      {problem.description && (
        <p className="mb-3 line-clamp-2 text-sm text-chamber-300">
          {problem.description}
        </p>
      )}

      {/* Tags row */}
      <div className="flex flex-wrap items-center gap-2">
        {problem.wealth_tier && (
          <span className="rounded bg-chamber-800 px-2 py-0.5 text-xs font-medium uppercase text-gold-400">
            {problem.wealth_tier}
          </span>
        )}
        {problem.lifecycle_stage && (
          <LifecycleBadge stage={problem.lifecycle_stage} />
        )}
        {problem.pain_category && (
          <span className="rounded bg-chamber-800 px-2 py-0.5 text-xs text-chamber-300">
            {problem.pain_category.replace(/_/g, " ")}
          </span>
        )}
      </div>
    </a>
  );
}
