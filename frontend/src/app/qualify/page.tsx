"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface QuickCard {
  title: string;
  description: string;
  href: string;
  icon: string;
}

const cards: QuickCard[] = [
  {
    title: "Validate Problem",
    description: "Run a 4-point scorecard on any premium problem.",
    href: "/qualify/validate/new",
    icon: "\u2714",
  },
  {
    title: "Buyer Profile",
    description: "Generate rich ICP profiles by tier, stage, and pain.",
    href: "/qualify/buyer-profile",
    icon: "\uD83C\uDFAF",
  },
  {
    title: "Guardrails Check",
    description: "Run compliance and ethical guardrails on an offer.",
    href: "/qualify/guardrails",
    icon: "\uD83D\uDEE1",
  },
  {
    title: "Risk Queue",
    description: "Review and manage flagged items.",
    href: "/qualify/risk-queue",
    icon: "\u26A0",
  },
  {
    title: "Founder Readiness",
    description: "Assess skills, credentials, and network readiness.",
    href: "/qualify/buyer-profile",
    icon: "\uD83D\uDCCA",
  },
];

export default function QualifyHub() {
  const [recentValidations, setRecentValidations] = useState<
    { id: string; title: string; score: number }[]
  >([]);

  useEffect(() => {
    // Placeholder for recent validations — would fetch from API
    setRecentValidations([
      { id: "1", title: "Privacy Shield Service", score: 8.2 },
      { id: "2", title: "Family Governance Suite", score: 7.5 },
      { id: "3", title: "Travel Concierge Platform", score: 6.9 },
    ]);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Qualify
        </h1>
        <p className="mt-2 text-white/60">
          Validate problems, profile buyers, check guardrails, and assess
          readiness.
        </p>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/10"
          >
            <span className="mb-3 text-2xl">{card.icon}</span>
            <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-white/50">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent validations */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Recent Validations
        </h2>
        {recentValidations.length === 0 ? (
          <p className="text-white/40">No recent validations.</p>
        ) : (
          <div className="space-y-2">
            {recentValidations.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-5 py-3"
              >
                <span className="text-white">{v.title}</span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    v.score >= 7
                      ? "bg-emerald-500/20 text-emerald-400"
                      : v.score >= 5
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {v.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
