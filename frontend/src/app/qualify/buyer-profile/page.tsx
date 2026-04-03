"use client";

import { useState, useEffect } from "react";

const generatedProfile = {
  name: "The Jet-Set Family Office Principal",
  demographics: { age: "45-65", netWorth: "$30M-$500M", location: "NYC, Miami, London, Dubai", familySize: "2-4 dependents" },
  psychographics: ["Values time over money", "Expects white-glove service", "Privacy-conscious", "Relationship-driven decisions", "Demands exclusivity"],
  painPoints: ["Unreliable last-minute charter availability", "Fragmented vendor management", "Lack of transparency in pricing", "No single point of accountability"],
  buyingBehavior: { decisionTime: "2-4 weeks", budget: "$150K-$500K/yr", channels: ["Referral", "Private events", "Advisor recommendation"], triggers: ["Bad experience with current provider", "Life event (new property, yacht)"] },
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function BuyerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [form, setForm] = useState({ problem: "", market: "", priceRange: "", notes: "" });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setShowProfile(true); }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/qualify" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Qualify</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">ICP Builder</h1>
      <p className="text-chamber-400 mb-8">Build an Ideal Client Profile using AI analysis</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Define Your Target</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Problem Area</label>
              <input type="text" placeholder="e.g., Private Aviation Charter Gaps" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Target Market</label>
              <select value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option value="">Select market segment</option>
                <option value="uhnw">UHNW ($30M+)</option>
                <option value="hnw">HNW ($5M-$30M)</option>
                <option value="family-office">Family Offices</option>
                <option value="corporate">Corporate Executives</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Price Range</label>
              <input type="text" placeholder="e.g., $150K-$500K/yr" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Additional Notes</label>
              <textarea rows={3} placeholder="Any specific requirements or constraints..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
            <button onClick={handleGenerate} disabled={generating} className="w-full px-4 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {generating && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
              {generating ? "Generating Profile..." : "Generate ICP"}
            </button>
          </div>
        </div>

        {/* Generated Profile */}
        <div>
          {showProfile ? (
            <div className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gold-400">{generatedProfile.name}</h3>
                <span className="px-2 py-0.5 bg-gold-400/20 text-gold-400 text-xs rounded-full">AI Generated</span>
              </div>

              <div>
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Demographics</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(generatedProfile.demographics).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-xs text-chamber-500 capitalize">{k.replace(/([A-Z])/g, " $1")}: </span>
                      <span className="text-sm text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Psychographics</p>
                <div className="flex flex-wrap gap-2">
                  {generatedProfile.psychographics.map((p) => (
                    <span key={p} className="px-2 py-1 bg-chamber-800 text-chamber-300 text-xs rounded-full">{p}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Pain Points</p>
                <ul className="space-y-1">
                  {generatedProfile.painPoints.map((p) => (
                    <li key={p} className="text-sm text-chamber-300 pl-3 border-l-2 border-red-400/50">{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-2">Buying Behavior</p>
                <div className="space-y-1 text-sm">
                  <p className="text-chamber-300"><span className="text-chamber-500">Decision Time:</span> {generatedProfile.buyingBehavior.decisionTime}</p>
                  <p className="text-chamber-300"><span className="text-chamber-500">Budget:</span> {generatedProfile.buyingBehavior.budget}</p>
                  <p className="text-chamber-300"><span className="text-chamber-500">Channels:</span> {generatedProfile.buyingBehavior.channels.join(", ")}</p>
                  <p className="text-chamber-300"><span className="text-chamber-500">Triggers:</span> {generatedProfile.buyingBehavior.triggers.join("; ")}</p>
                </div>
              </div>

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
