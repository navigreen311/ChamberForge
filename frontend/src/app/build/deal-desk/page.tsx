"use client";

import { useState } from "react";
import api from "@/lib/api";

interface Proposal {
  title: string;
  executive_summary: string;
  scope_of_work: string[];
  deliverables: string[];
  timeline: string;
  pricing_summary: {
    monthly_fee: number;
    setup_fee: number;
    payment_terms: string;
    billing_cycle: string;
  };
  terms: string;
  nda_required: boolean;
}

export default function DealDeskPage() {
  const [offerName, setOfferName] = useState("");
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [monthlyFee, setMonthlyFee] = useState(10000);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateProposal() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/api/v1/build/deal-desk/proposal", {
        offer_data: {
          name: offerName || "Premium Advisory",
          delivery_model: "done_for_you",
          pricing_model: { monthly_fee: monthlyFee },
        },
        client_data: {
          name: clientName || "Client",
          company: company,
        },
      });
      setProposal(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to generate proposal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-6">Deal Desk</h1>
      <p className="text-chamber-300 mb-8">
        Generate proposals, SOWs, and NDAs for your premium engagements.
      </p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      {/* Input Form */}
      <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6 mb-8 max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-4">Proposal Generator</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Offer Name</label>
            <input
              type="text"
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              placeholder="e.g., Wealth Preservation Advisory"
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
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
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., James Richardson"
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Richardson Family Office"
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
        <button
          onClick={generateProposal}
          disabled={loading}
          className="bg-gold-500 hover:bg-gold-600 text-chamber-950 font-semibold px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Proposal"}
        </button>
      </div>

      {/* Proposal Output */}
      {proposal && (
        <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-8 max-w-3xl">
          <h2 className="text-2xl font-bold text-gold-400 mb-4">{proposal.title}</h2>

          <section className="mb-6">
            <h3 className="text-white font-semibold mb-2">Executive Summary</h3>
            <p className="text-chamber-300">{proposal.executive_summary}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-white font-semibold mb-2">Scope of Work</h3>
            <ul className="list-disc list-inside text-chamber-300 space-y-1">
              {proposal.scope_of_work.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-white font-semibold mb-2">Deliverables</h3>
            <ul className="list-disc list-inside text-chamber-300 space-y-1">
              {proposal.deliverables.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-white font-semibold mb-2">Timeline</h3>
            <p className="text-chamber-300">{proposal.timeline}</p>
          </section>

          <section className="mb-6">
            <h3 className="text-white font-semibold mb-2">Pricing</h3>
            <div className="bg-chamber-800 rounded p-4 space-y-2 text-chamber-300">
              <p>
                Monthly Fee:{" "}
                <span className="text-gold-400 font-semibold">
                  ${proposal.pricing_summary.monthly_fee.toLocaleString()}
                </span>
              </p>
              {proposal.pricing_summary.setup_fee > 0 && (
                <p>
                  Setup Fee: ${proposal.pricing_summary.setup_fee.toLocaleString()}
                </p>
              )}
              <p>Payment Terms: {proposal.pricing_summary.payment_terms}</p>
              <p>Billing: {proposal.pricing_summary.billing_cycle}</p>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-white font-semibold mb-2">Terms</h3>
            <p className="text-chamber-300">{proposal.terms}</p>
          </section>

          {proposal.nda_required && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3 text-yellow-300 text-sm">
              NDA Required — mutual non-disclosure agreement will be provided for execution.
            </div>
          )}
        </div>
      )}
    </main>
  );
}
