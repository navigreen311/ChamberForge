"use client";

import { useState } from "react";
import PlaybookComposer from "@/components/modules/PlaybookComposer";

// Demo playbooks for the UI
const DEMO_PLAYBOOKS = [
  {
    id: "pb-1",
    name: "Wealth Advisory",
    icp: { net_worth: ">$10M", interests: ["real estate", "art"] },
    sops: [
      { name: "Onboarding SOP", steps: ["welcome call", "asset review"] },
      { name: "Quarterly Review SOP", steps: ["portfolio analysis", "report"] },
    ],
    pricing: { min: 5000, max: 15000, pricing_model: "retainer" },
    journey: [
      { name: "Discovery" },
      { name: "Proposal" },
      { name: "Onboarding" },
      { name: "Management" },
    ],
    kpis: ["client retention", "AUM growth", "NPS"],
  },
  {
    id: "pb-2",
    name: "Lifestyle Concierge",
    icp: { net_worth: ">$5M", interests: ["travel", "dining"] },
    sops: [
      { name: "Concierge Intake SOP", steps: ["preferences", "schedule"] },
      { name: "Vendor Management SOP", steps: ["vet vendor", "negotiate"] },
    ],
    pricing: { min: 3000, max: 10000, pricing_model: "project" },
    journey: [
      { name: "Intake" },
      { name: "Curation" },
      { name: "Fulfillment" },
      { name: "Follow-up" },
    ],
    kpis: ["satisfaction score", "repeat bookings", "response time"],
  },
  {
    id: "pb-3",
    name: "Family Office Operations",
    icp: { net_worth: ">$50M", interests: ["governance", "succession"] },
    sops: [
      { name: "Governance SOP", steps: ["family meeting", "charter review"] },
      { name: "Succession Planning SOP", steps: ["assess", "document"] },
    ],
    pricing: { min: 10000, max: 50000, pricing_model: "annual" },
    journey: [
      { name: "Assessment" },
      { name: "Design" },
      { name: "Implementation" },
      { name: "Review" },
    ],
    kpis: ["family alignment score", "governance compliance", "succession readiness"],
  },
];

export default function ComposerPage() {
  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Cross-Playbook Composer
      </h1>
      <p className="text-chamber-400 mb-8">
        Select 2-3 playbooks to compose into a unified system with bundled
        pricing.
      </p>
      <PlaybookComposer playbooks={DEMO_PLAYBOOKS} />
    </div>
  );
}
