"use client";

import { useState } from "react";
import SOPViewer from "@/components/modules/SOPViewer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DeliveryRisk {
  risk: string;
  probability: string;
  impact: string;
  mitigation: string;
}

interface SOP {
  title: string;
  steps: string[];
  owner: string;
  frequency: string;
}

interface SOPBundle {
  staffing_plan: { role: string; responsibilities: string; hours_per_week: number }[];
  tooling_stack: string[];
  service_calendar: { week: number; deliverables: string }[];
  delivery_risks: DeliveryRisk[];
  sops: SOP[];
}

export default function FulfillmentPage() {
  const [offerName, setOfferName] = useState("");
  const [bundle, setBundle] = useState<SOPBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sops" | "risks" | "calendar">("sops");

  async function generateBundle() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/build/fulfillment/sop-bundle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: offerName || "Premium Service" }),
      });
      const data = await res.json();
      setBundle(data);
    } catch (err) {
      console.error("Failed to generate SOP bundle:", err);
    } finally {
      setLoading(false);
    }
  }

  const riskColor = (probability: string) => {
    switch (probability.toLowerCase()) {
      case "high": return "bg-red-900/40 border-red-700";
      case "medium": return "bg-yellow-900/40 border-yellow-700";
      case "low": return "bg-green-900/40 border-green-700";
      default: return "bg-chamber-800 border-chamber-600";
    }
  };

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-6">Fulfillment OS</h1>
      <p className="text-chamber-300 mb-8">
        Generate SOP bundles and delivery risk maps for your service offers.
      </p>

      <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6 mb-8 max-w-xl">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-chamber-300 text-sm mb-1">Offer Name</label>
            <input
              type="text"
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              placeholder="e.g., Family Office CFO Services"
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
          </div>
          <button
            onClick={generateBundle}
            disabled={loading}
            className="bg-gold-500 hover:bg-gold-600 text-chamber-950 font-semibold px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate SOP Bundle"}
          </button>
        </div>
      </div>

      {bundle && (
        <>
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            {(["sops", "risks", "calendar"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded font-medium capitalize ${
                  activeTab === tab
                    ? "bg-gold-500 text-chamber-950"
                    : "bg-chamber-800 text-chamber-300"
                }`}
              >
                {tab === "sops" ? `SOPs (${bundle.sops.length})` : tab === "risks" ? "Delivery Risks" : "Service Calendar"}
              </button>
            ))}
          </div>

          {/* SOPs Tab */}
          {activeTab === "sops" && <SOPViewer sops={bundle.sops} />}

          {/* Risks Tab */}
          {activeTab === "risks" && (
            <div className="grid gap-4 md:grid-cols-2">
              {bundle.delivery_risks.map((risk, i) => (
                <div
                  key={i}
                  className={`border rounded-lg p-4 ${riskColor(risk.probability)}`}
                >
                  <h3 className="text-white font-semibold mb-2">{risk.risk}</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="text-chamber-400">Probability:</span>{" "}
                      <span className="capitalize">{risk.probability}</span>
                    </p>
                    <p>
                      <span className="text-chamber-400">Impact:</span>{" "}
                      <span className="capitalize">{risk.impact}</span>
                    </p>
                    <p className="text-chamber-300 mt-2">{risk.mitigation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <div className="space-y-3">
              {bundle.service_calendar.map((entry, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start bg-chamber-900 border border-chamber-700 rounded-lg p-4"
                >
                  <div className="bg-gold-500 text-chamber-950 font-bold rounded px-3 py-1 text-sm min-w-[80px] text-center">
                    Week {entry.week}
                  </div>
                  <p className="text-chamber-300">{entry.deliverables}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
