"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface GuardrailCheck {
  id: number | string;
  name: string;
  description: string;
  status: string;
  details: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function GuardrailsPage() {
  const [pageLoading, setPageLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState<GuardrailCheck[]>([]);
  const [offerData, setOfferData] = useState({ offer_name: "", category: "", target_market: "", price_range: "" });

  const runChecks = async () => {
    try {
      setRunning(true);
      setError(null);
      const res = await api.post("/api/v1/qualify/guardrails-check", { offer_data: offerData });
      const data = res.data;
      setChecks(Array.isArray(data) ? data : data.checks ?? data.results ?? data.items ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Guardrails check failed");
    } finally {
      setRunning(false);
    }
  };

  // Normalize status to lowercase
  const normalizeStatus = (s: string) => (s || "").toLowerCase().replace("block", "fail");

  const passCount = checks.filter((c) => normalizeStatus(c.status) === "pass").length;
  const warnCount = checks.filter((c) => ["warning", "warn"].includes(normalizeStatus(c.status))).length;
  const failCount = checks.filter((c) => ["fail", "block"].includes(normalizeStatus(c.status))).length;

  const statusKey = (s: string) => {
    const n = normalizeStatus(s);
    if (n === "pass") return "pass";
    if (n === "warning" || n === "warn") return "warning";
    return "fail";
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/qualify" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Qualify</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Guardrails Check</h1>
      <p className="text-chamber-400 mb-8">Ethical, regulatory, and operational compliance verification</p>

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {/* Offer Data Form */}
      <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Offer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-chamber-300 mb-1 block">Offer Name</label>
            <input type="text" placeholder="e.g., Private Aviation Charter Platform" value={offerData.offer_name} onChange={(e) => setOfferData({ ...offerData, offer_name: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
          </div>
          <div>
            <label className="text-sm text-chamber-300 mb-1 block">Category</label>
            <input type="text" placeholder="e.g., Aviation" value={offerData.category} onChange={(e) => setOfferData({ ...offerData, category: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
          </div>
          <div>
            <label className="text-sm text-chamber-300 mb-1 block">Target Market</label>
            <input type="text" placeholder="e.g., UHNW individuals" value={offerData.target_market} onChange={(e) => setOfferData({ ...offerData, target_market: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
          </div>
          <div>
            <label className="text-sm text-chamber-300 mb-1 block">Price Range</label>
            <input type="text" placeholder="e.g., $150K-$500K/yr" value={offerData.price_range} onChange={(e) => setOfferData({ ...offerData, price_range: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
          </div>
        </div>
        <button onClick={runChecks} disabled={running} className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center gap-2">
          {running && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
          {running ? "Running Checks..." : "Run Guardrails Check"}
        </button>
      </div>

      {checks.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-chamber-900 rounded-xl p-5 border border-green-400/30 text-center">
              <p className="text-3xl font-bold text-green-400">{passCount}</p>
              <p className="text-sm text-chamber-400">Passed</p>
            </div>
            <div className="bg-chamber-900 rounded-xl p-5 border border-gold-400/30 text-center">
              <p className="text-3xl font-bold text-gold-400">{warnCount}</p>
              <p className="text-sm text-chamber-400">Warnings</p>
            </div>
            <div className="bg-chamber-900 rounded-xl p-5 border border-red-400/30 text-center">
              <p className="text-3xl font-bold text-red-400">{failCount}</p>
              <p className="text-sm text-chamber-400">Failed</p>
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-3">
            {checks.map((check, idx) => {
              const sk = statusKey(check.status);
              return (
                <div key={check.id ?? idx} className={`bg-chamber-900 rounded-xl p-5 border ${
                  sk === "pass" ? "border-green-400/20" :
                  sk === "warning" ? "border-gold-400/20" :
                  "border-red-400/20"
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      sk === "pass" ? "bg-green-400/20 text-green-400" :
                      sk === "warning" ? "bg-gold-400/20 text-gold-400" :
                      "bg-red-400/20 text-red-400"
                    }`}>
                      {sk === "pass" ? "\u2713" : sk === "warning" ? "!" : "\u2717"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{check.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sk === "pass" ? "bg-green-400/20 text-green-400" :
                          sk === "warning" ? "bg-gold-400/20 text-gold-400" :
                          "bg-red-400/20 text-red-400"
                        }`}>{check.status.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-chamber-500 mb-2">{check.description}</p>
                      <p className="text-sm text-chamber-300">{check.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3">
            <button className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Acknowledge & Proceed</button>
            <button onClick={runChecks} disabled={running} className="px-5 py-2.5 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition">Re-run Checks</button>
          </div>
        </>
      )}

      {checks.length === 0 && !running && (
        <div className="bg-chamber-900 rounded-xl p-12 border border-chamber-800 text-center">
          <p className="text-chamber-500 text-lg mb-2">No checks run yet</p>
          <p className="text-chamber-600 text-sm">Fill out the offer details above and click Run Guardrails Check</p>
        </div>
      )}
    </div>
  );
}
