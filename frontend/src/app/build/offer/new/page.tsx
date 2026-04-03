"use client";

import { useState, useEffect } from "react";

const steps = [
  { title: "Problem Selection", desc: "Choose the validated problem this offer solves" },
  { title: "Service Definition", desc: "Define core deliverables and service scope" },
  { title: "Pricing Strategy", desc: "Set pricing tiers and billing structure" },
  { title: "Delivery Model", desc: "Configure fulfillment workflow and team" },
  { title: "Compliance Review", desc: "Run automated guardrail checks" },
  { title: "Launch Setup", desc: "Finalize and activate the offer" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function NewOfferPage() {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-16 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Create New Offer</h1>
      <p className="text-chamber-400 mb-8">6-step wizard to build a premium service offer</p>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button key={i} onClick={() => setCurrentStep(i)} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              i === currentStep ? "bg-gold-400 text-chamber-950" :
              i < currentStep ? "bg-green-400 text-chamber-950" :
              "bg-chamber-800 text-chamber-500"
            }`}>{i < currentStep ? "✓" : i + 1}</div>
            <span className={`text-sm whitespace-nowrap ${i === currentStep ? "text-white font-medium" : "text-chamber-500"}`}>{s.title}</span>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < currentStep ? "bg-green-400" : "bg-chamber-800"}`} />}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-chamber-900 rounded-xl p-8 border border-chamber-800 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Step {currentStep + 1}: {steps[currentStep].title}</h2>
        <p className="text-chamber-400 mb-6">{steps[currentStep].desc}</p>

        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Select Validated Problem</label>
              <select className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option>Private Aviation Charter Gaps (Score: 92)</option>
                <option>Estate Staff Retention Crisis (Score: 87)</option>
                <option>Concierge Service Fragmentation (Score: 89)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Offer Name</label>
              <input type="text" placeholder="e.g., Private Aviation Concierge" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Brief Description</label>
              <textarea rows={3} placeholder="Describe the core value proposition..." className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Core Deliverables</label>
              <textarea rows={4} placeholder="List the main deliverables (one per line)..." className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Service Level</label>
              <select className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option>Platinum — 24/7 dedicated support</option>
                <option>Gold — Priority business hours</option>
                <option>Silver — Standard response times</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-chamber-300 mb-1 block">Pricing Model</label>
                <select className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                  <option>Monthly Retainer</option>
                  <option>Per-Transaction</option>
                  <option>Tiered Subscription</option>
                  <option>Value-Based</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-chamber-300 mb-1 block">Base Price</label>
                <input type="text" placeholder="$0" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
              </div>
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Billing Frequency</label>
              <select className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Annually</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Delivery Team</label>
              <input type="text" placeholder="e.g., Account Manager + 2 Specialists" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Fulfillment Workflow</label>
              <textarea rows={3} placeholder="Describe the step-by-step delivery process..." className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <p className="text-chamber-300">Running automated compliance checks...</p>
            <div className="space-y-2">
              {["Ethical Compliance", "Regulatory Alignment", "Data Privacy", "AML Screening"].map((c) => (
                <div key={c} className="flex items-center gap-3 p-3 bg-chamber-800/50 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center text-xs">✓</div>
                  <span className="text-sm text-white">{c}</span>
                  <span className="text-xs text-green-400 ml-auto">Passed</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gold-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gold-400">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Launch</h3>
            <p className="text-chamber-400 mb-6">Your offer has passed all checks and is ready to go live.</p>
            <button className="px-6 py-3 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Activate Offer</button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-5 py-2.5 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition disabled:opacity-30"
        >Previous</button>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-30"
        >Next Step</button>
      </div>
    </div>
  );
}
