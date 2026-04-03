"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface BuyerProfile {
  name: string;
  demographics: Record<string, string>;
  psychographics: string[];
  pain_points?: string[];
  painPoints?: string[];
  buying_behavior?: {
    decision_time?: string;
    decisionTime?: string;
    budget?: string;
    channels?: string[];
    triggers?: string[];
  };
  buyingBehavior?: {
    decision_time?: string;
    decisionTime?: string;
    budget?: string;
    channels?: string[];
    triggers?: string[];
  };
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function BuyerProfilePage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [form, setForm] = useState({ wealth_tier: "", life_stage: "", pain_category: "" });

  useEffect(() => {
    // Page is ready immediately — no data to pre-fetch
    setPageLoading(false);
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const res = await api.post("/api/v1/qualify/buyer-profile", {
        wealth_tier: form.wealth_tier,
        life_stage: form.life_stage,
        pain_category: form.pain_category,
      });
      setProfile(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Failed to generate profile");
    } finally {
      setGenerating(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  const painPoints = profile?.pain_points ?? profile?.painPoints ?? [];
  const buyingBehavior = profile?.buying_behavior ?? profile?.buyingBehavior;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/qualify" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Qualify</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">ICP Builder</h1>
      <p className="text-chamber-400 mb-8">Build an Ideal Client Profile using AI analysis</p>

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Define Your Target</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Wealth Tier</label>
              <select value={form.wealth_tier} onChange={(e) => setForm({ ...form, wealth_tier: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option value="">Select wealth tier</option>
                <option value="uhnw">UHNW ($30M+)</option>
                <option value="hnw">HNW ($5M-$30M)</option>
                <option value="affluent">Affluent ($1M-$5M)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Life Stage</label>
              <select value={form.life_stage} onChange={(e) => setForm({ ...form, life_stage: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option value="">Select life stage</option>
                <option value="wealth_building">Wealth Building</option>
                <option value="wealth_preservation">Wealth Preservation</option>
                <option value="wealth_transfer">Wealth Transfer</option>
                <option value="retirement">Retirement</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Pain Category</label>
              <input type="text" placeholder="e.g., Aviation, Estate Management, Finance" value={form.pain_category} onChange={(e) => setForm({ ...form, pain_category: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <button onClick={handleGenerate} disabled={generating} className="w-full px-4 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {generating && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
              {generating ? "Generating Profile..." : "Generate ICP"}
            </button>
          </div>
        </div>

        {/* Generated Profile */}
        <div>
          {profile ? (
            <div className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gold-400">{profile.name}</h3>
                <span className="px-2 py-0.5 bg-gold-400/20 text-gold-400 text-xs rounded-full">AI Generated</span>
              </div>

              <div>
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Demographics</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(profile.demographics ?? {}).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-xs text-chamber-500 capitalize">{k.replace(/([A-Z_])/g, " $1").trim()}: </span>
                      <span className="text-sm text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Psychographics</p>
                <div className="flex flex-wrap gap-2">
                  {(profile.psychographics ?? []).map((p) => (
                    <span key={p} className="px-2 py-1 bg-chamber-800 text-chamber-300 text-xs rounded-full">{p}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Pain Points</p>
                <ul className="space-y-1">
                  {painPoints.map((p) => (
                    <li key={p} className="text-sm text-chamber-300 pl-3 border-l-2 border-red-400/50">{p}</li>
                  ))}
                </ul>
              </div>

              {buyingBehavior && (
                <div>
                  <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Buying Behavior</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-chamber-300"><span className="text-chamber-500">Decision Time:</span> {buyingBehavior.decision_time ?? buyingBehavior.decisionTime ?? "—"}</p>
                    <p className="text-chamber-300"><span className="text-chamber-500">Budget:</span> {buyingBehavior.budget ?? "—"}</p>
                    <p className="text-chamber-300"><span className="text-chamber-500">Channels:</span> {(buyingBehavior.channels ?? []).join(", ") || "—"}</p>
                    <p className="text-chamber-300"><span className="text-chamber-500">Triggers:</span> {(buyingBehavior.triggers ?? []).join("; ") || "—"}</p>
                  </div>
                </div>
              )}

              <button className="w-full px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-gold-400 transition text-sm">Export Profile</button>
            </div>
          ) : (
            <div className="bg-chamber-900 rounded-xl p-12 border border-chamber-800 text-center">
              <p className="text-chamber-500 text-lg mb-2">No profile generated yet</p>
              <p className="text-chamber-600 text-sm">Fill out the form and click Generate ICP to create a buyer profile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
