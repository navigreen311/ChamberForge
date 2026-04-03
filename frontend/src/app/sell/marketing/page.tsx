"use client";

import { useState, useEffect } from "react";

const generatedCopy = {
  subject: "Exclusive: Streamline Your Private Aviation Experience",
  body: `Dear [First Name],

I noticed your family office has been expanding its travel portfolio, and I wanted to share how our Private Aviation Concierge service has helped families like yours eliminate the 3-5 day booking delays that plague traditional charter services.

Our platform provides:
• Instant access to 2,400+ verified aircraft globally
• Dedicated aviation coordinator available 24/7
• Transparent pricing with no hidden surcharges
• Full compliance documentation handled for you

The Henderson Family Office reduced their charter booking time from 4 days to under 2 hours after partnering with us.

Would you be open to a brief 15-minute conversation this week?

Best regards`,
  toneScore: 92,
  readability: "Grade 10",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function MarketingPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [form, setForm] = useState({ offer: "", audience: "", tone: "Professional", channel: "Email" });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setShowResult(true); }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/sell" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Sell</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Marketing Copy Generator</h1>
      <p className="text-chamber-400 mb-8">AI-powered outreach copy tailored for premium service audiences</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
          <h3 className="text-lg font-semibold text-white mb-4">Generate Copy</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Service/Offer</label>
              <select value={form.offer} onChange={(e) => setForm({ ...form, offer: e.target.value })} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option value="">Select an offer</option>
                <option value="aviation">Private Aviation Concierge</option>
                <option value="estate">Estate Management Platform</option>
                <option value="advisory">Family Office Advisory</option>
              </select>
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
            <button onClick={handleGenerate} disabled={generating} className="w-full px-4 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {generating && <span className="w-4 h-4 border-2 border-chamber-950 border-t-transparent rounded-full animate-spin" />}
              {generating ? "Generating..." : "Generate Copy"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {showResult ? (
            <div className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Copy</h3>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-green-400/20 text-green-400 text-xs rounded-full">Tone: {generatedCopy.toneScore}/100</span>
                  <span className="px-2 py-0.5 bg-blue-400/20 text-blue-400 text-xs rounded-full">{generatedCopy.readability}</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-1">Subject Line</p>
                <p className="text-white font-medium">{generatedCopy.subject}</p>
              </div>
              <div className="mb-4">
                <p className="text-xs text-chamber-500 uppercase tracking-wider mb-1">Body</p>
                <pre className="text-sm text-chamber-300 whitespace-pre-wrap font-sans">{generatedCopy.body}</pre>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition text-sm">Copy to Clipboard</button>
                <button className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm">Regenerate</button>
                <button className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm">Edit</button>
              </div>
            </div>
          ) : (
            <div className="bg-chamber-900 rounded-xl p-12 border border-chamber-800 text-center">
              <p className="text-chamber-500 text-lg mb-2">No copy generated yet</p>
              <p className="text-chamber-600 text-sm">Configure your parameters and click Generate Copy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
