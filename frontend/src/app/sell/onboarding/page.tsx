"use client";

import { useState } from "react";
import api from "@/lib/api";

interface Milestone {
  day: number;
  task: string;
  status: string;
}

interface Phase {
  phase: string;
  days: string;
  start: string;
  end: string;
  objectives: string[];
  milestones: Milestone[];
}

interface OnboardingPlan {
  id: string;
  client_name: string;
  service_type: string;
  start_date: string;
  end_date: string;
  phases: Phase[];
  status: string;
  completion_pct: number;
}

export default function OnboardingPage() {
  const [clientName, setClientName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/v1/sell/onboarding/plan", {
        client_name: clientName,
        service_type: serviceType,
        start_date: startDate || null,
      });
      setPlan(res.data);
    } catch (err) {
      console.error("Failed to create plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const phaseColors: Record<string, string> = {
    Foundation: "border-blue-500/40 bg-blue-500/5",
    Acceleration: "border-amber-500/40 bg-amber-500/5",
    Optimization: "border-emerald-500/40 bg-emerald-500/5",
  };

  const phaseAccent: Record<string, string> = {
    Foundation: "text-blue-400",
    Acceleration: "text-amber-400",
    Optimization: "text-emerald-400",
  };

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-white">Client Onboarding</h1>
        <p className="mt-2 text-zinc-400">
          Build 90-day onboarding timelines for new clients
        </p>

        {/* Form */}
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Service Type
              </label>
              <input
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., Executive Advisory"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading || !clientName || !serviceType}
            className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create 90-Day Plan"}
          </button>
        </div>

        {/* Timeline */}
        {plan && (
          <div className="mt-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {plan.client_name} — {plan.service_type}
                </h2>
                <p className="text-sm text-zinc-400">
                  {plan.start_date.slice(0, 10)} to {plan.end_date.slice(0, 10)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-400">Completion</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {plan.completion_pct}%
                </p>
              </div>
            </div>

            {/* Phase Cards */}
            <div className="space-y-6">
              {plan.phases.map((phase) => (
                <div
                  key={phase.phase}
                  className={`rounded-xl border p-6 ${
                    phaseColors[phase.phase] || "border-zinc-800 bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-lg font-semibold ${
                        phaseAccent[phase.phase] || "text-white"
                      }`}
                    >
                      {phase.phase}
                    </h3>
                    <span className="text-sm text-zinc-400">
                      Days {phase.days}
                    </span>
                  </div>

                  {/* Objectives */}
                  <div className="mt-3">
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      Objectives
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-zinc-300">
                      {phase.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Milestones Timeline */}
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      Milestones
                    </p>
                    <div className="mt-2 space-y-2">
                      {phase.milestones.map((ms, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-4 py-2"
                        >
                          <span className="w-16 shrink-0 text-sm font-medium text-zinc-400">
                            Day {ms.day}
                          </span>
                          <div className="h-2 w-2 shrink-0 rounded-full bg-zinc-600" />
                          <span className="flex-1 text-sm text-white">
                            {ms.task}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              ms.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            {ms.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
