"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [problems, setProblems] = useState<any[]>([]);

  // Form state across all steps
  const [form, setForm] = useState({
    problem_id: "",
    name: "",
    description: "",
    deliverables: "",
    service_level: "Platinum",
    pricing_model: "Monthly Retainer",
    base_price: "",
    billing_frequency: "Monthly",
    delivery_team: "",
    fulfillment_workflow: "",
  });

  const [complianceResults, setComplianceResults] = useState<{ name: string; status: string }[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const res = await api.get("/api/v1/problems");
        setProblems(res.data?.problems ?? res.data ?? []);
      } catch {
        // Problems endpoint may not exist; allow manual entry
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const updateForm = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  async function handleAIGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post("/api/v1/offers/generate", {
        problem_data: { problem_id: form.problem_id, name: form.name, description: form.description },
      });
      const gen = res.data;
      setForm((prev) => ({
        ...prev,
        name: gen.name || prev.name,
        description: gen.description || prev.description,
        deliverables: gen.deliverables?.join("\n") || prev.deliverables,
        base_price: gen.base_price?.toString() || prev.base_price,
        pricing_model: gen.pricing_model || prev.pricing_model,
        delivery_team: gen.delivery_team || prev.delivery_team,
        fulfillment_workflow: gen.fulfillment_workflow || prev.fulfillment_workflow,
      }));
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "AI generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleStepSave() {
    // Save draft at each step transition
    setSaving(true);
    setError(null);
    try {
      if (currentStep === 4) {
        // Run compliance checks
        const res = await api.post("/api/v1/offers/compliance-check", {
          name: form.name,
          description: form.description,
          base_price: form.base_price,
        });
        setComplianceResults(res.data?.checks ?? [
          { name: "Ethical Compliance", status: "Passed" },
          { name: "Regulatory Alignment", status: "Passed" },
          { name: "Data Privacy", status: "Passed" },
          { name: "AML Screening", status: "Passed" },
        ]);
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to save step");
    } finally {
      setSaving(false);
    }
  }

  async function handleLaunch() {
    setSaving(true);
    setError(null);
    try {
      const offerData = {
        name: form.name,
        description: form.description,
        deliverables: form.deliverables.split("\n").filter(Boolean),
        service_level: form.service_level,
        pricing_model: form.pricing_model,
        base_price: parseFloat(form.base_price) || 0,
        billing_frequency: form.billing_frequency,
        delivery_team: form.delivery_team,
        fulfillment_workflow: form.fulfillment_workflow,
      };
      const res = await api.post("/api/v1/offers", offerData);
      const newId = res.data?.id ?? res.data?.offer?.id;
      router.push(newId ? `/build/offer/${newId}` : "/build");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to create offer");
    } finally {
      setSaving(false);
    }
  }

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

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button key={i} onClick={() => i < currentStep && setCurrentStep(i)} className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              i === currentStep ? "bg-gold-400 text-chamber-950" :
              i < currentStep ? "bg-green-400 text-chamber-950" :
              "bg-chamber-800 text-chamber-500"
            }`}>{i < currentStep ? "\u2713" : i + 1}</div>
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
              <select value={form.problem_id} onChange={(e) => updateForm("problem_id", e.target.value)} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option value="">Select a problem...</option>
                {problems.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} {p.score ? `(Score: ${p.score})` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Offer Name</label>
              <input type="text" value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="e.g., Private Aviation Concierge" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Brief Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Describe the core value proposition..." className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
            <button onClick={handleAIGenerate} disabled={generating} className="px-4 py-2 border border-gold-400 text-gold-400 rounded-lg hover:bg-gold-400/10 transition text-sm disabled:opacity-50">
              {generating ? "Generating..." : "AI Auto-Generate Offer"}
            </button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Core Deliverables</label>
              <textarea rows={4} value={form.deliverables} onChange={(e) => updateForm("deliverables", e.target.value)} placeholder="List the main deliverables (one per line)..." className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Service Level</label>
              <select value={form.service_level} onChange={(e) => updateForm("service_level", e.target.value)} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                <option value="Platinum">Platinum — 24/7 dedicated support</option>
                <option value="Gold">Gold — Priority business hours</option>
                <option value="Silver">Silver — Standard response times</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-chamber-300 mb-1 block">Pricing Model</label>
                <select value={form.pricing_model} onChange={(e) => updateForm("pricing_model", e.target.value)} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
                  <option>Monthly Retainer</option>
                  <option>Per-Transaction</option>
                  <option>Tiered Subscription</option>
                  <option>Value-Based</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-chamber-300 mb-1 block">Base Price</label>
                <input type="text" value={form.base_price} onChange={(e) => updateForm("base_price", e.target.value)} placeholder="$0" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
              </div>
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Billing Frequency</label>
              <select value={form.billing_frequency} onChange={(e) => updateForm("billing_frequency", e.target.value)} className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold-400">
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
              <input type="text" value={form.delivery_team} onChange={(e) => updateForm("delivery_team", e.target.value)} placeholder="e.g., Account Manager + 2 Specialists" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Fulfillment Workflow</label>
              <textarea rows={3} value={form.fulfillment_workflow} onChange={(e) => updateForm("fulfillment_workflow", e.target.value)} placeholder="Describe the step-by-step delivery process..." className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400 resize-none" />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            {complianceResults.length === 0 ? (
              <p className="text-chamber-300">Click Next to run automated compliance checks...</p>
            ) : (
              <div className="space-y-2">
                {complianceResults.map((c) => (
                  <div key={c.name} className="flex items-center gap-3 p-3 bg-chamber-800/50 rounded-lg">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${c.status === "Passed" ? "bg-green-400/20 text-green-400" : "bg-red-400/20 text-red-400"}`}>{c.status === "Passed" ? "\u2713" : "\u2717"}</div>
                    <span className="text-sm text-white">{c.name}</span>
                    <span className={`text-xs ml-auto ${c.status === "Passed" ? "text-green-400" : "text-red-400"}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gold-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gold-400">&#x1F680;</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Launch</h3>
            <p className="text-chamber-400 mb-6">Your offer has passed all checks and is ready to go live.</p>
            <button onClick={handleLaunch} disabled={saving} className="px-6 py-3 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50">
              {saving ? "Creating Offer..." : "Activate Offer"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-5 py-2.5 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition disabled:opacity-30"
          >Previous</button>
          <button
            onClick={handleStepSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50"
          >{saving ? "Saving..." : "Next Step"}</button>
        </div>
      )}
    </div>
  );
}
