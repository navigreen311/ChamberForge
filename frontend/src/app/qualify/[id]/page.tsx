"use client";

import { use } from "react";
import Link from "next/link";

/* ── Mock Data ──────────────────────────────────────────────────────── */

const MOCK_QUALIFICATIONS: Record<string, {
  problemTitle: string;
  problemDescription: string;
  urgencyScore: number;
  credibilityScore: number;
  wtpSignal: number;
  compositeScore: number;
  wealthTier: string;
  buyerType: string;
  lifecycleStage: string;
  triggerEvent: string;
  citationCount: number;
  topSources: { name: string; credibility: number }[];
  status: "Qualified" | "Needs Review" | "Disqualified";
}> = {
  "1": {
    problemTitle: "Coordination Overload in Multi-Staff Households",
    problemDescription:
      "UHNW families with 5+ staff members across multiple residences face daily scheduling conflicts, duplicated tasks, and communication breakdowns that cost an estimated 15–20 hours per week in wasted coordination effort.",
    urgencyScore: 8.5,
    credibilityScore: 9.0,
    wtpSignal: 7.8,
    compositeScore: 8.4,
    wealthTier: "UHNW ($30M+)",
    buyerType: "Family Office Principal",
    lifecycleStage: "Active Management",
    triggerEvent: "New property acquisition requiring additional staff",
    citationCount: 14,
    topSources: [
      { name: "Campden Wealth Global Family Office Report 2025", credibility: 9.2 },
      { name: "Deloitte Private Wealth Management Survey", credibility: 8.8 },
      { name: "Knight Frank Wealth Report", credibility: 8.5 },
    ],
    status: "Qualified",
  },
  "2": {
    problemTitle: "Cyber Fraud & AI Impersonation Risk",
    problemDescription:
      "Wealthy individuals are increasingly targeted by deepfake voice/video impersonation and sophisticated phishing attacks. Current security solutions are consumer-grade and fail to address the unique threat surface of high-profile households.",
    urgencyScore: 9.2,
    credibilityScore: 7.5,
    wtpSignal: 6.4,
    compositeScore: 7.7,
    wealthTier: "HNW ($5M–$30M)",
    buyerType: "Individual / Spouse",
    lifecycleStage: "Wealth Preservation",
    triggerEvent: "Recent phishing attempt targeting family member",
    citationCount: 9,
    topSources: [
      { name: "Barclays Private Banking Cyber Threat Brief", credibility: 8.7 },
      { name: "Mandiant HNW Threat Intelligence Report", credibility: 9.0 },
      { name: "Family Office Exchange Security Survey", credibility: 7.6 },
    ],
    status: "Needs Review",
  },
  "3": {
    problemTitle: "Premium Health Navigation Gap",
    problemDescription:
      "Despite unlimited budgets, wealthy families struggle to coordinate between concierge doctors, specialists, and international medical facilities. The lack of a unified health command center leads to duplicated tests, missed follow-ups, and suboptimal outcomes.",
    urgencyScore: 5.2,
    credibilityScore: 6.0,
    wtpSignal: 4.8,
    compositeScore: 5.3,
    wealthTier: "HNW ($5M–$30M)",
    buyerType: "Spouse / Health Advocate",
    lifecycleStage: "Generational Planning",
    triggerEvent: "Family member health scare",
    citationCount: 5,
    topSources: [
      { name: "Mayo Clinic Executive Health Program Data", credibility: 7.9 },
      { name: "Private Health Management Industry Survey", credibility: 6.5 },
    ],
    status: "Disqualified",
  },
};

const FALLBACK = {
  problemTitle: "Unknown Problem",
  problemDescription: "No data found for this qualification ID.",
  urgencyScore: 0,
  credibilityScore: 0,
  wtpSignal: 0,
  compositeScore: 0,
  wealthTier: "—",
  buyerType: "—",
  lifecycleStage: "—",
  triggerEvent: "—",
  citationCount: 0,
  topSources: [] as { name: string; credibility: number }[],
  status: "Disqualified" as const,
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

function scoreColor(score: number): string {
  if (score >= 7.5) return "bg-green-400";
  if (score >= 5) return "bg-[#C9A84C]";
  return "bg-red-400";
}

function scoreTextColor(score: number): string {
  if (score >= 7.5) return "text-green-400";
  if (score >= 5) return "text-[#C9A84C]";
  return "text-red-400";
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    Qualified: "bg-green-400/20 text-green-400",
    "Needs Review": "bg-[#C9A84C]/20 text-[#C9A84C]",
    Disqualified: "bg-red-400/20 text-red-400",
  };
  return styles[status] ?? "bg-gray-400/20 text-gray-400";
}

/* ── Page Component ──────────────────────────────────────────────────── */

export default function QualifyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const data = MOCK_QUALIFICATIONS[id] ?? FALLBACK;

  const metrics = [
    { label: "Urgency Score", value: data.urgencyScore },
    { label: "Credibility Score", value: data.credibilityScore },
    { label: "WTP Signal", value: data.wtpSignal },
    { label: "Composite Score", value: data.compositeScore },
  ];

  const profileFields = [
    { label: "Wealth Tier", value: data.wealthTier },
    { label: "Buyer Type", value: data.buyerType },
    { label: "Lifecycle Stage", value: data.lifecycleStage },
    { label: "Trigger Event", value: data.triggerEvent },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] p-8">
      {/* Back link */}
      <Link
        href="/qualify"
        className="text-[#C9A84C] text-sm hover:underline mb-4 inline-block"
      >
        &larr; Back to Qualify
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-display font-bold text-white">
            {data.problemTitle}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(data.status)}`}
          >
            {data.status}
          </span>
        </div>
        <p className="text-gray-400 max-w-3xl leading-relaxed">
          {data.problemDescription}
        </p>
      </div>

      {/* Qualification Scorecard */}
      <section className="bg-[#111827] rounded-xl border border-[#1e2a3a] p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-5">
          Qualification Scorecard
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{m.label}</span>
                <span
                  className={`text-lg font-bold ${scoreTextColor(m.value)}`}
                >
                  {m.value.toFixed(1)}
                  <span className="text-xs text-gray-500 font-normal">
                    {" "}
                    / 10
                  </span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${scoreColor(m.value)}`}
                  style={{ width: `${m.value * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column: Buyer Profile + Evidence Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Buyer Profile */}
        <section className="bg-[#111827] rounded-xl border border-[#1e2a3a] p-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            Buyer Profile
          </h2>
          <dl className="space-y-4">
            {profileFields.map((f) => (
              <div key={f.label} className="flex justify-between items-start">
                <dt className="text-sm text-gray-500">{f.label}</dt>
                <dd className="text-sm text-white font-medium text-right max-w-[60%]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Evidence Summary */}
        <section className="bg-[#111827] rounded-xl border border-[#1e2a3a] p-6">
          <h2 className="text-lg font-semibold text-white mb-5">
            Evidence Summary
          </h2>
          <div className="mb-4">
            <span className="text-sm text-gray-500">Total Citations</span>
            <p className="text-2xl font-bold text-white">{data.citationCount}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Top Sources
            </span>
            <div className="mt-3 space-y-3">
              {data.topSources.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-gray-300 truncate">
                    {s.name}
                  </span>
                  <span
                    className={`text-sm font-semibold whitespace-nowrap ${scoreTextColor(s.credibility)}`}
                  >
                    {s.credibility.toFixed(1)}
                  </span>
                </div>
              ))}
              {data.topSources.length === 0 && (
                <p className="text-sm text-gray-600">No sources available.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Link
          href="/build/offer/new"
          className="px-6 py-3 bg-[#C9A84C] text-[#0D1117] font-semibold rounded-lg hover:bg-[#d4b85d] transition"
        >
          Build Offer &rarr;
        </Link>
        <Link
          href="/qualify"
          className="px-6 py-3 border border-[#1e2a3a] text-gray-300 rounded-lg hover:border-gray-500 transition"
        >
          Back to Qualify
        </Link>
      </div>
    </div>
  );
}
