"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface KPI {
  kpi_name: string;
  measurement_method: string;
  target: string;
  frequency: string;
  data_source: string;
}

interface ROIFramework {
  value_delivered: {
    category: string;
    metric: string;
    baseline: string;
    target: string;
    monetary_value: number;
  }[];
  total_estimated_roi: number;
  roi_multiple: number;
  payback_period_months: number;
}

export default function ProofBuilderPage() {
  const [offerName, setOfferName] = useState("");
  const [deliveryModel, setDeliveryModel] = useState("done_for_you");
  const [monthlyFee, setMonthlyFee] = useState(10000);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [roi, setRoi] = useState<ROIFramework | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"kpi" | "roi">("kpi");

  const offerData = {
    name: offerName || "Premium Advisory",
    delivery_model: deliveryModel,
    pricing_model: { monthly_fee: monthlyFee },
  };

  async function generateKPIs() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/build/proof/kpi-stack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData),
      });
      const data = await res.json();
      setKpis(data);
      setActiveTab("kpi");
    } catch (err) {
      console.error("Failed to generate KPIs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function generateROI() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/build/proof/roi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData),
      });
      const data = await res.json();
      setRoi(data);
      setActiveTab("roi");
    } catch (err) {
      console.error("Failed to generate ROI:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-6">Proof Builder</h1>
      <p className="text-chamber-300 mb-8">
        Design KPI stacks and ROI frameworks to prove your value to HNW clients.
      </p>

      {/* Offer Input Form */}
      <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6 mb-8 max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">Offer Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Offer Name</label>
            <input
              type="text"
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              placeholder="e.g., Family Office CFO Services"
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Delivery Model</label>
            <select
              value={deliveryModel}
              onChange={(e) => setDeliveryModel(e.target.value)}
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            >
              <option value="done_for_you">Done For You</option>
              <option value="done_with_you">Done With You</option>
              <option value="advisory">Advisory</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Monthly Fee ($)</label>
            <input
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(Number(e.target.value))}
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateKPIs}
              disabled={loading}
              className="bg-gold-500 hover:bg-gold-600 text-chamber-950 font-semibold px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Generating..." : "Design KPI Stack"}
            </button>
            <button
              onClick={generateROI}
              disabled={loading}
              className="bg-chamber-700 hover:bg-chamber-600 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate ROI Framework"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("kpi")}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "kpi"
              ? "bg-gold-500 text-chamber-950"
              : "bg-chamber-800 text-chamber-300"
          }`}
        >
          KPI Stack ({kpis.length})
        </button>
        <button
          onClick={() => setActiveTab("roi")}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "roi"
              ? "bg-gold-500 text-chamber-950"
              : "bg-chamber-800 text-chamber-300"
          }`}
        >
          ROI Framework
        </button>
      </div>

      {/* KPI Results */}
      {activeTab === "kpi" && kpis.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-chamber-900 border border-chamber-700 rounded-lg p-4">
              <h3 className="text-gold-400 font-semibold mb-2">{kpi.kpi_name}</h3>
              <div className="text-sm text-chamber-300 space-y-1">
                <p><span className="text-chamber-400">Method:</span> {kpi.measurement_method}</p>
                <p><span className="text-chamber-400">Target:</span> {kpi.target}</p>
                <p><span className="text-chamber-400">Frequency:</span> {kpi.frequency}</p>
                <p><span className="text-chamber-400">Data Source:</span> {kpi.data_source}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROI Results */}
      {activeTab === "roi" && roi && (
        <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gold-400">
                ${roi.total_estimated_roi.toLocaleString()}
              </p>
              <p className="text-chamber-400 text-sm">Total Estimated ROI</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gold-400">{roi.roi_multiple}x</p>
              <p className="text-chamber-400 text-sm">ROI Multiple</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gold-400">
                {roi.payback_period_months} mo
              </p>
              <p className="text-chamber-400 text-sm">Payback Period</p>
            </div>
          </div>
          <h3 className="text-white font-semibold mb-3">Value Delivered</h3>
          <div className="space-y-2">
            {roi.value_delivered.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-chamber-800 rounded p-3"
              >
                <div>
                  <span className="text-gold-400 font-medium">{item.category}</span>
                  <span className="text-chamber-400 ml-2">- {item.metric}</span>
                </div>
                <span className="text-green-400 font-semibold">
                  ${item.monetary_value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
