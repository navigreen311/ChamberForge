"use client";

import { useState } from "react";
import api from "@/lib/api";

interface GeneratedCopy {
  subject: string;
  body: string;
  toneScore?: number;
  tone_score?: number;
  readability?: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function MarketingPage() {
  const [generating, setGenerating] = useState(false);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedCopy | null>(null);
  const [outreachResult, setOutreachResult] = useState<any | null>(null);
  const [form, setForm] = useState({ offer: "", audience: "", tone: "Professional", channel: "Email" });

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post("/api/v1/sell/copy/positioning", {
        name: form.offer || "Premium Service",
        audience: form.audience || "UHNW individuals",
        tone: form.tone,
        channel: form.channel,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to generate copy");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateOutreach() {
    setGeneratingOutreach(true);
    setError(null);
    try {
      const res = await api.post("/api/v1/sell/copy/outreach", {
        offer: form.offer || "Premium Service",
        audience: form.audience || "UHNW individuals",
        tone: form.tone,
        channel: form.channel,
      });
      setOutreachResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to generate outreach sequence");
    } finally {
      setGeneratingOutreach(false);
    }
  }

  const toneScore = result?.toneScore ?? result?.tone_score;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Marketing Copy Generator</h1>
      <p className="text-chamber-400 mb-8">AI-powered outreach copy tailored for premium service audiences</p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Generate Copy</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Service/Offer</label>
              <input type="text" value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} placeholder="e.g., Private Aviation Concierge" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Target Audience</label>
              <input type="text" placeholder="e.g., Family office principals, $50M+ net worth" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-chamber-300 mb-1 block">Tone</label>
                <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                  <option>Professional</option>
                  <option>Warm & Personal</option>
                  <option>Authoritative</option>
                  <option>Conversational</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-chamber-300 mb-1 block">Channel</label>
                <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                  <option>Email</option>
                  <option>LinkedIn</option>
                  <option>Direct Mail</option>
                  <option>SMS</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleGenerate} disabled={generating} className="flex-1 px-4 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {generating && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
                {generating ? "Generating..." : "Generate Positioning Copy"}
              </button>
              <button onClick={handleGenerateOutreach} disabled={generatingOutreach} className="flex-1 px-4 py-2.5 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {generatingOutreach && <span className="w-4 h-4 border-2 border-chamber-400 border-t-transparent rounded-full animate-spin" />}
                {generatingOutreach ? "Generating..." : "Generate Outreach Sequence"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Copy</h3>
                <div className="flex gap-2">
                  {toneScore && <span className="px-2 py-0.5 bg-green-400/20 text-green-400 text-xs rounded-full">Tone: {toneScore}/100</span>}
                  {result.readability && <span className="px-2 py-0.5 bg-blue-400/20 text-blue-400 text-xs rounded-full">{result.readability}</span>}
                </div>
              </div>
              {result.subject && (
                <div className="mb-4">
                  <p className="text-xs text-chamber-500 uppercase tracking-wider mb-1">Subject Line</p>
                  <p className="text-white font-medium">{result.subject}</p>
                </div>
              )}
              <div className="mb-4">
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-1">Body</p>
                <pre className="text-sm text-chamber-300 whitespace-pre-wrap font-sans">{result.body}</pre>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(`${result.subject}\n\n${result.body}`)} className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition text-sm">Copy to Clipboard</button>
                <button onClick={handleGenerate} disabled={generating} className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm">Regenerate</button>
              </div>
            </div>
          ) : (
            <div className="bg-chamber-900 rounded-xl p-12 border border-chamber-800 text-center mb-6">
              <p className="text-chamber-500 text-lg mb-2">No copy generated yet</p>
              <p className="text-chamber-600 text-sm">Configure your parameters and click Generate</p>
            </div>
          )}

          {outreachResult && (
            <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
              <h3 className="text-lg font-semibold text-white mb-4">Outreach Sequence</h3>
              <pre className="text-sm text-chamber-300 whitespace-pre-wrap font-sans">{typeof outreachResult === "string" ? outreachResult : JSON.stringify(outreachResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
