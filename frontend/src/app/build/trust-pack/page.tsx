"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TrustPackData {
  credibility_sheet: {
    firm_name: string;
    experience: string;
    credentials: string[];
    testimonials: { quote: string; attribution: string }[];
    client_count: string | number;
    years_in_business: string | number;
  };
  privacy_statement: string;
  due_diligence_items: string[];
  briefing_deck_outline: string[];
}

export default function TrustPackPage() {
  const [firmName, setFirmName] = useState("");
  const [offerName, setOfferName] = useState("");
  const [trustPack, setTrustPack] = useState<TrustPackData | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateTrustPack() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/build/trust-pack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_data: { name: firmName || "Our Firm" },
          offer_data: { name: offerName || "Premium Service" },
        }),
      });
      const data = await res.json();
      setTrustPack(data);
    } catch (err) {
      console.error("Failed to generate trust pack:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-bold text-gold-400 mb-6">Trust Pack Studio</h1>
      <p className="text-chamber-300 mb-8">
        Build credibility packages, privacy statements, and due diligence materials.
      </p>

      <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6 mb-8 max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Firm Name</label>
            <input
              type="text"
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="e.g., Apex Wealth Advisors"
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-chamber-300 text-sm mb-1">Offer Name</label>
            <input
              type="text"
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              placeholder="e.g., Family Office Advisory"
              className="w-full bg-chamber-800 border border-chamber-600 rounded px-3 py-2 text-white"
            />
          </div>
          <button
            onClick={generateTrustPack}
            disabled={loading}
            className="bg-gold-500 hover:bg-gold-600 text-chamber-950 font-semibold px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Trust Pack"}
          </button>
        </div>
      </div>

      {trustPack && (
        <div className="space-y-6 max-w-3xl">
          {/* Credibility Sheet */}
          <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gold-400 mb-4">Credibility Sheet</h2>
            <p className="text-chamber-300 mb-4">{trustPack.credibility_sheet.experience}</p>
            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">Credentials</h3>
              <ul className="list-disc list-inside text-chamber-300 space-y-1">
                {trustPack.credibility_sheet.credentials.map((cred, i) => (
                  <li key={i}>{cred}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Testimonials</h3>
              {trustPack.credibility_sheet.testimonials.map((t, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 border-gold-500 pl-4 text-chamber-300 italic mb-2"
                >
                  &ldquo;{t.quote}&rdquo;
                  <footer className="text-chamber-400 text-sm mt-1 not-italic">
                    &mdash; {t.attribution}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>

          {/* Privacy Statement */}
          <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gold-400 mb-3">Privacy Statement</h2>
            <p className="text-chamber-300">{trustPack.privacy_statement}</p>
          </div>

          {/* Due Diligence */}
          <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gold-400 mb-3">Due Diligence Checklist</h2>
            <ul className="space-y-2">
              {trustPack.due_diligence_items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-chamber-300">
                  <span className="text-gold-500 mt-0.5">&#x2713;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Briefing Deck */}
          <div className="bg-chamber-900 border border-chamber-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gold-400 mb-3">Briefing Deck Outline</h2>
            <ol className="list-decimal list-inside text-chamber-300 space-y-2">
              {trustPack.briefing_deck_outline.map((slide, i) => (
                <li key={i}>{slide}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </main>
  );
}
