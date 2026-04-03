"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PlaybookProgress from "@/components/modules/PlaybookProgress";

interface Playbook {
  id: string;
  slug: string;
  name: string;
  target_buyer: string;
  price_range_min: number;
  price_range_max: number;
  core_pain: string;
  icp: Record<string, string>;
  pricing_model: Record<string, unknown>;
}

interface Activation {
  id: string;
  status: string;
  completed_sections: number;
  total_sections: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const WIZARD_STEPS = [
  "Review Defaults",
  "Customize ICP",
  "Adjust Pricing",
  "Confirm",
] as const;

type WizardStep = (typeof WIZARD_STEPS)[number];

export default function ActivatePlaybookPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<WizardStep>("Review Defaults");
  const [activation, setActivation] = useState<Activation | null>(null);
  const [activating, setActivating] = useState(false);

  // Customization state
  const [icpOverrides, setIcpOverrides] = useState<Record<string, string>>({});
  const [pricingOverrides, setPricingOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchPlaybook() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/playbooks/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setPlaybook(data);
        // Pre-populate overrides with current values
        setIcpOverrides({ ...data.icp });
        const pm: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.pricing_model)) {
          pm[k] = v === null ? "" : String(v);
        }
        setPricingOverrides(pm);
      } catch {
        setPlaybook(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybook();
  }, [slug]);

  const stepIndex = WIZARD_STEPS.indexOf(currentStep);

  function goNext() {
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStep(WIZARD_STEPS[stepIndex + 1]);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setCurrentStep(WIZARD_STEPS[stepIndex - 1]);
    }
  }

  async function handleActivate() {
    if (!playbook) return;
    setActivating(true);
    try {
      // Generate a workspace ID (in production this comes from auth context)
      const workspaceId = crypto.randomUUID();

      // 1. Activate
      const activateRes = await fetch(
        `${API_BASE}/api/v1/playbooks/${slug}/activate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspace_id: workspaceId }),
        }
      );
      if (!activateRes.ok) throw new Error("Activation failed");
      const { activation: act } = await activateRes.json();

      // 2. Apply customizations
      const overrides: Record<string, unknown> = {};
      if (Object.keys(icpOverrides).length > 0) {
        overrides.icp = icpOverrides;
      }
      if (Object.keys(pricingOverrides).length > 0) {
        overrides.pricing_model = pricingOverrides;
      }

      if (Object.keys(overrides).length > 0) {
        await fetch(
          `${API_BASE}/api/v1/playbooks/activations/${act.id}/customize`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ overrides }),
          }
        );
      }

      setActivation(act);
    } catch (err) {
      console.error("Activation error:", err);
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chamber-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chamber-950">
        <p className="text-chamber-400">Playbook not found.</p>
      </div>
    );
  }

  // Post-activation view
  if (activation) {
    return (
      <div className="min-h-screen bg-chamber-950 px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Playbook Activated</h1>
            <p className="mt-2 text-chamber-300">
              {playbook.name} is now active. Begin working through each section.
            </p>
          </div>
          <PlaybookProgress
            playbookName={playbook.name}
            completionPct={0}
            sections={[
              { name: "ICP Definition", status: "not_started" },
              { name: "Pain Trigger Mapping", status: "not_started" },
              { name: "SOP Configuration", status: "not_started" },
              { name: "Pricing Model Setup", status: "not_started" },
              { name: "KPI Stack Calibration", status: "not_started" },
              { name: "Trust & Objection Prep", status: "not_started" },
              { name: "VoiceForge Asset Generation", status: "not_started" },
              { name: "VisionAudio Asset Generation", status: "not_started" },
            ]}
            nextStep="ICP Definition"
          />
          <button
            onClick={() => router.push("/build/playbooks")}
            className="mt-6 w-full rounded-lg border border-chamber-700 px-4 py-3 text-sm text-chamber-300 hover:border-chamber-500 hover:text-white"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <h1 className="mb-2 text-2xl font-bold text-white">
          Activate: {playbook.name}
        </h1>
        <p className="mb-8 text-chamber-300">{playbook.core_pain}</p>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center gap-2">
          {WIZARD_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  i <= stepIndex
                    ? "bg-gold-500 text-chamber-950"
                    : "bg-chamber-800 text-chamber-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  i === stepIndex ? "text-white" : "text-chamber-500"
                }`}
              >
                {step}
              </span>
              {i < WIZARD_STEPS.length - 1 && (
                <div className="mx-2 h-px w-8 bg-chamber-700" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-chamber-700 bg-chamber-900 p-6">
          {/* Step 1: Review Defaults */}
          {currentStep === "Review Defaults" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">
                Review Default Configuration
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-chamber-800/50 p-4">
                  <span className="text-xs font-medium uppercase text-chamber-400">
                    Target Buyer
                  </span>
                  <p className="mt-1 text-white">{playbook.target_buyer}</p>
                </div>
                <div className="rounded-lg bg-chamber-800/50 p-4">
                  <span className="text-xs font-medium uppercase text-chamber-400">
                    Price Range
                  </span>
                  <p className="mt-1 text-white">
                    ${playbook.price_range_min.toLocaleString()} &ndash; $
                    {playbook.price_range_max.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-chamber-800/50 p-4">
                <span className="text-xs font-medium uppercase text-chamber-400">
                  Core Pain
                </span>
                <p className="mt-1 text-white">{playbook.core_pain}</p>
              </div>
            </div>
          )}

          {/* Step 2: Customize ICP */}
          {currentStep === "Customize ICP" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Customize Ideal Client Profile
              </h2>
              <p className="text-sm text-chamber-400">
                Adjust the ICP fields to match your specific target market.
              </p>
              <div className="space-y-3">
                {Object.entries(icpOverrides).map(([key, value]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-chamber-400">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setIcpOverrides((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2.5 text-sm text-white placeholder-chamber-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Adjust Pricing */}
          {currentStep === "Adjust Pricing" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Adjust Pricing Model
              </h2>
              <p className="text-sm text-chamber-400">
                Fine-tune the pricing model for your market positioning.
              </p>
              <div className="space-y-3">
                {Object.entries(pricingOverrides).map(([key, value]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-chamber-400">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setPricingOverrides((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-chamber-700 bg-chamber-800 px-4 py-2.5 text-sm text-white placeholder-chamber-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === "Confirm" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">
                Confirm Activation
              </h2>
              <p className="text-sm text-chamber-300">
                You are about to activate <strong>{playbook.name}</strong> with
                your customizations. This will create your personalized playbook
                with 8 sections to complete.
              </p>
              <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 p-4">
                <p className="text-sm text-gold-400">
                  Once activated, you can continue customizing and track your
                  progress through each section.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            className="rounded-lg border border-chamber-700 px-6 py-2.5 text-sm text-chamber-300 hover:border-chamber-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Back
          </button>
          {currentStep === "Confirm" ? (
            <button
              onClick={handleActivate}
              disabled={activating}
              className="rounded-lg bg-gold-500 px-8 py-2.5 text-sm font-semibold text-chamber-950 hover:bg-gold-400 disabled:opacity-50"
            >
              {activating ? "Activating..." : "Activate Playbook"}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-chamber-950 hover:bg-gold-400"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
