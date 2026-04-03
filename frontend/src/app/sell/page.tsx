"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PipelineStage {
  name: string;
  href: string;
  description: string;
  icon: string;
  count: number;
  status: "active" | "setup" | "idle";
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    name: "Marketing & Copy",
    href: "/sell/marketing",
    description: "Dream 100, positioning copy, outreach sequences",
    icon: "M",
    count: 0,
    status: "active",
  },
  {
    name: "Revenue Projector",
    href: "/sell/revenue",
    description: "Revenue modeling with growth and churn dynamics",
    icon: "R",
    count: 0,
    status: "active",
  },
  {
    name: "Persona Simulator",
    href: "/sell/persona-sim",
    description: "AI roleplay practice for sales conversations",
    icon: "P",
    count: 0,
    status: "active",
  },
  {
    name: "Client Onboarding",
    href: "/sell/onboarding",
    description: "90-day plans and welcome protocols",
    icon: "O",
    count: 0,
    status: "active",
  },
  {
    name: "Client Retention",
    href: "/sell/retention",
    description: "Health scores, upsell triggers, renewal cadence",
    icon: "C",
    count: 0,
    status: "active",
  },
  {
    name: "Decision Room",
    href: "#",
    description: "Stakeholder maps and multi-party approvals",
    icon: "D",
    count: 0,
    status: "setup",
  },
  {
    name: "Proof & Reputation",
    href: "#",
    description: "Case studies and testimonial workflows",
    icon: "T",
    count: 0,
    status: "setup",
  },
  {
    name: "Expert Network",
    href: "#",
    description: "Expert directory and credential verification",
    icon: "E",
    count: 0,
    status: "setup",
  },
  {
    name: "GTM Lab",
    href: "#",
    description: "Headline testing and price anchoring",
    icon: "G",
    count: 0,
    status: "setup",
  },
  {
    name: "Authority Positioning",
    href: "#",
    description: "Content plans and media placements",
    icon: "A",
    count: 0,
    status: "setup",
  },
  {
    name: "Outcome Intelligence",
    href: "#",
    description: "KPI tracking and quarterly scorecards",
    icon: "K",
    count: 0,
    status: "setup",
  },
  {
    name: "Partner Builder",
    href: "#",
    description: "Ecosystem mapping and partner vetting",
    icon: "B",
    count: 0,
    status: "setup",
  },
  {
    name: "Trust Network",
    href: "#",
    description: "Gatekeeper personas and referral paths",
    icon: "N",
    count: 0,
    status: "setup",
  },
];

const statusColors = {
  active: "border-emerald-500/40 bg-emerald-500/5",
  setup: "border-amber-500/30 bg-amber-500/5",
  idle: "border-zinc-700 bg-zinc-900/50",
};

const statusBadge = {
  active: "bg-emerald-500/20 text-emerald-400",
  setup: "bg-amber-500/20 text-amber-400",
  idle: "bg-zinc-700 text-zinc-400",
};

export default function SellHub() {
  const [stages] = useState<PipelineStage[]>(PIPELINE_STAGES);

  const activeCount = stages.filter((s) => s.status === "active").length;
  const totalModules = stages.length;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Sell & Retain</h1>
          <p className="mt-2 text-zinc-400">
            {totalModules} modules | {activeCount} active
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Active Modules</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Pipeline Stages</p>
            <p className="mt-1 text-2xl font-bold text-white">{totalModules}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">AI Agents</p>
            <p className="mt-1 text-2xl font-bold text-violet-400">2</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="text-sm text-zinc-400">Backbone Services</p>
            <p className="mt-1 text-2xl font-bold text-blue-400">11</p>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage) => (
            <Link
              key={stage.name}
              href={stage.href}
              className={`group rounded-xl border p-6 transition-all hover:scale-[1.02] ${statusColors[stage.status]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-sm font-bold text-white">
                  {stage.icon}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[stage.status]}`}
                >
                  {stage.status}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-emerald-400">
                {stage.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">{stage.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
