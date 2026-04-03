"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LifecycleBadge from "@/components/modules/LifecycleBadge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ProblemDetail {
  id: string;
  title: string;
  description?: string | null;
  workspace_id: string;
  wealth_tier?: string | null;
  buyer_type?: string | null;
  life_stage?: string | null;
  trigger_event?: string | null;
  pain_category?: string | null;
  wtp_profile?: string | null;
  trust_channel?: string | null;
  compliance_risk?: string | null;
  delivery_model?: string | null;
  proof_metric?: string | null;
  lifecycle_stage?: string | null;
  urgency_score?: number | null;
  wtp_confidence?: number | null;
  source?: string | null;
  geo?: string | null;
  created_at: string;
  updated_at: string;
}

function urgencyGaugeColor(score: number): string {
  if (score >= 8) return "#ef4444";
  if (score >= 5) return "#eab308";
  return "#22c55e";
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between border-b border-chamber-800 py-2">
      <span className="text-sm text-chamber-400">{label}</span>
      <span className="text-sm font-medium capitalize text-white">
        {value.replace(/_/g, " ")}
      </span>
    </div>
  );
}

export default function ProblemDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/v1/problems/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Problem not found");
        return r.json();
      })
      .then(setProblem)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-chamber-950 text-red-400">
        {error}
      </main>
    );
  }

  if (!problem) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-chamber-950 text-chamber-400">
        Loading...
      </main>
    );
  }

  const urgency = problem.urgency_score ?? 0;
  const wtpConf = problem.wtp_confidence ?? 0;

  return (
    <main className="min-h-screen bg-chamber-950 text-white">
      <header className="border-b border-chamber-800 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <a
            href="/discover"
            className="mb-2 inline-block text-sm text-gold-400 hover:underline"
          >
            &larr; Back to Discovery
          </a>
          <h1 className="text-3xl font-display font-bold">{problem.title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Main column */}
          <div className="md:col-span-2 space-y-6">
            {problem.description && (
              <p className="text-base leading-relaxed text-chamber-200">
                {problem.description}
              </p>
            )}

            <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-5">
              <h2 className="mb-3 text-sm font-semibold text-chamber-400 uppercase tracking-wider">
                Ontology Fields
              </h2>
              <FieldRow label="Wealth Tier" value={problem.wealth_tier} />
              <FieldRow label="Buyer Type" value={problem.buyer_type} />
              <FieldRow label="Life Stage" value={problem.life_stage} />
              <FieldRow label="Trigger Event" value={problem.trigger_event} />
              <FieldRow label="Pain Category" value={problem.pain_category} />
              <FieldRow label="WTP Profile" value={problem.wtp_profile} />
              <FieldRow label="Trust Channel" value={problem.trust_channel} />
              <FieldRow label="Compliance Risk" value={problem.compliance_risk} />
              <FieldRow label="Delivery Model" value={problem.delivery_model} />
              <FieldRow label="Proof Metric" value={problem.proof_metric} />
              <FieldRow label="Source" value={problem.source} />
              <FieldRow label="Geo" value={problem.geo} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Urgency gauge */}
            <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-5 text-center">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-chamber-400">
                Urgency Score
              </h3>
              <svg viewBox="0 0 120 70" width={160} height={90}>
                {/* Background arc */}
                <path
                  d="M 10 65 A 50 50 0 0 1 110 65"
                  fill="none"
                  stroke="#334e68"
                  strokeWidth={10}
                  strokeLinecap="round"
                />
                {/* Filled arc proportional to urgency/10 */}
                <path
                  d="M 10 65 A 50 50 0 0 1 110 65"
                  fill="none"
                  stroke={urgencyGaugeColor(urgency)}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${(urgency / 10) * 157} 157`}
                />
                <text
                  x={60}
                  y={60}
                  textAnchor="middle"
                  fontSize={28}
                  fontWeight="bold"
                  fill={urgencyGaugeColor(urgency)}
                >
                  {urgency}
                </text>
              </svg>
            </div>

            {/* WTP confidence */}
            <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-5 text-center">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-chamber-400">
                WTP Confidence
              </h3>
              <p className="text-3xl font-bold text-gold-400">
                {(wtpConf * 100).toFixed(0)}%
              </p>
            </div>

            {/* Lifecycle badge */}
            {problem.lifecycle_stage && (
              <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-5 text-center">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-chamber-400">
                  Lifecycle Stage
                </h3>
                <LifecycleBadge stage={problem.lifecycle_stage} className="text-sm px-4 py-1" />
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-chamber-500 space-y-1">
              <p>Created: {new Date(problem.created_at).toLocaleDateString()}</p>
              <p>Updated: {new Date(problem.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
