"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Playbook {
  id: string;
  slug: string;
  name: string;
  target_buyer: string;
  price_range_min: number;
  price_range_max: number;
  core_pain: string;
  icp: Record<string, string>;
  pain_triggers: string[];
  pricing_model: Record<string, unknown>;
  sop_skeleton: { name: string; steps: string[] }[];
  trust_concerns: string[];
  objection_handling: { objection: string; response: string }[];
  kpi_stack: { kpi: string; target: string; measurement?: string }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TABS = [
  "ICP",
  "Pain Triggers",
  "SOPs",
  "Pricing",
  "KPIs",
  "Trust Concerns",
  "Objections",
] as const;

type Tab = (typeof TABS)[number];

export default function PlaybookDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("ICP");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaybook() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/playbooks/${slug}`);
        if (!res.ok) throw new Error("Playbook not found");
        setPlaybook(await res.json());
      } catch {
        setPlaybook(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybook();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chamber-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chamber-950">
        <p className="text-chamber-400">Playbook not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/build/playbooks"
          className="mb-8 inline-flex items-center text-sm text-chamber-400 hover:text-gold-400"
        >
          &larr; Back to Gallery
        </Link>

        {/* Hero */}
        <div className="mb-10 rounded-xl border border-chamber-700 bg-chamber-900 p-8">
          <h1 className="text-3xl font-bold text-white">{playbook.name}</h1>
          <div className="mt-4 flex flex-wrap gap-4">
            <span className="rounded-full bg-chamber-800 px-3 py-1 text-sm text-chamber-300">
              {playbook.target_buyer}
            </span>
            <span className="rounded-full bg-gold-500/10 px-3 py-1 text-sm font-medium text-gold-400">
              ${playbook.price_range_min.toLocaleString()} &ndash; $
              {playbook.price_range_max.toLocaleString()}/mo
            </span>
          </div>
          <p className="mt-4 text-chamber-300">{playbook.core_pain}</p>
          <Link
            href={`/build/playbooks/${slug}/activate`}
            className="mt-6 inline-flex items-center rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-chamber-950 hover:bg-gold-400"
          >
            Activate This Playbook
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-chamber-800 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-gold-500/10 text-gold-400"
                  : "text-chamber-400 hover:bg-chamber-800 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-6">
          {activeTab === "ICP" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Ideal Client Profile
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(playbook.icp).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-chamber-800/50 p-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-chamber-400">
                      {key.replace(/_/g, " ")}
                    </span>
                    <p className="mt-1 text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Pain Triggers" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Pain Triggers
              </h2>
              <ul className="space-y-3">
                {playbook.pain_triggers.map((trigger, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-lg bg-chamber-800/50 p-4"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">
                      {i + 1}
                    </span>
                    <span className="text-sm text-chamber-200">{trigger}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "SOPs" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">
                SOP Skeleton
              </h2>
              {playbook.sop_skeleton.map((sop, i) => (
                <div key={i} className="rounded-lg bg-chamber-800/50 p-5">
                  <h3 className="mb-3 font-medium text-gold-400">
                    {sop.name}
                  </h3>
                  <ol className="space-y-2">
                    {sop.steps.map((step, j) => (
                      <li key={j} className="flex gap-3 text-sm text-chamber-200">
                        <span className="flex-shrink-0 text-chamber-500">
                          {j + 1}.
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Pricing" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Pricing Model
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(playbook.pricing_model).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-chamber-800/50 p-4">
                    <span className="text-xs font-medium uppercase tracking-wider text-chamber-400">
                      {key.replace(/_/g, " ")}
                    </span>
                    <p className="mt-1 text-sm text-white">
                      {value === null ? "N/A" : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "KPIs" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">KPI Stack</h2>
              <div className="space-y-3">
                {playbook.kpi_stack.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-4 rounded-lg bg-chamber-800/50 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.kpi}
                      </p>
                      {item.measurement && (
                        <p className="mt-1 text-xs text-chamber-400">
                          Measured by: {item.measurement}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                      {item.target}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Trust Concerns" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Trust Concerns
              </h2>
              <div className="space-y-3">
                {playbook.trust_concerns.map((concern, i) => (
                  <div
                    key={i}
                    className="rounded-lg border-l-2 border-gold-500/30 bg-chamber-800/50 p-4"
                  >
                    <p className="text-sm text-chamber-200">{concern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Objections" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Objection Handling
              </h2>
              <div className="space-y-4">
                {playbook.objection_handling.map((item, i) => (
                  <div key={i} className="rounded-lg bg-chamber-800/50 p-5">
                    <p className="text-sm font-medium text-red-400">
                      &ldquo;{item.objection}&rdquo;
                    </p>
                    <p className="mt-3 text-sm text-chamber-200">
                      {item.response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
