"use client";

import { useState, useEffect } from "react";

const brief = {
  client: "Henderson Family Office",
  generatedAt: "2026-04-03 08:00 AM",
  healthScore: 96,
  sections: [
    {
      title: "Executive Summary",
      content: "The Henderson Family Office remains a top-tier client with strong engagement metrics. Quarterly review meeting scheduled for April 7. No immediate risk factors identified. Contract renewal opportunity in Q3 2026.",
    },
    {
      title: "Recent Activity",
      items: [
        "3 charter flights booked in March (up from 1 in February)",
        "Estate manager Maria Santos completed annual review",
        "New property acquisition in progress (Hamptons, $7.2M estimate)",
        "Victoria Henderson requested concierge services for charity gala (April 22)",
      ],
    },
    {
      title: "Financial Overview",
      items: [
        "Current MRR: $22,000 (Platinum tier)",
        "Lifetime value: $308,000 (14 months)",
        "All invoices paid on time — zero payment incidents",
        "Upsell opportunity: Art advisory services ($4,500/mo potential)",
      ],
    },
    {
      title: "Relationship Insights",
      items: [
        "Primary contact: James Henderson (Principal)",
        "Decision influencer: Victoria Henderson (strong preference for personalized service)",
        "Preferred communication: Phone for urgent, email for routine",
        "NPS score: 9/10 (Promoter)",
      ],
    },
    {
      title: "Risk Factors",
      items: [
        "None currently identified",
        "Monitor: Competitor outreach detected (Quintessentially sent intro materials)",
      ],
    },
    {
      title: "Recommended Actions",
      items: [
        "Prepare Q1 performance review presentation for April 7 meeting",
        "Proactively offer property management services for Hamptons acquisition",
        "Send personalized note re: charity gala — offer concierge support",
        "Begin art advisory upsell conversation with James",
      ],
    },
  ],
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function IntelBriefPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Intel Brief: {brief.client}</h1>
          <p className="text-chamber-400">Generated {brief.generatedAt}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-3xl font-bold text-green-400">{brief.healthScore}</span>
            <p className="text-xs text-chamber-500">Health Score</p>
          </div>
          <button className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm">Refresh Brief</button>
        </div>
      </div>

      <div className="space-y-6">
        {brief.sections.map((section, idx) => (
          <div key={idx} className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
            <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
            {section.content ? (
              <p className="text-chamber-300">{section.content}</p>
            ) : (
              <ul className="space-y-2">
                {section.items?.map((item, i) => (
                  <li key={i} className="text-sm text-chamber-300 pl-3 border-l-2 border-gold-400/30">{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
