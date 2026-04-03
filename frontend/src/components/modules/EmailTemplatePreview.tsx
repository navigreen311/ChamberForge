"use client";

import { useState, useMemo } from "react";

// Template metadata matching the backend registry
const TEMPLATES: Record<
  string,
  { subject: string; sampleVars: Record<string, string> }
> = {
  welcome: {
    subject: "Welcome to ChamberForge",
    sampleVars: {
      name: "Jane Doe",
      workspace_name: "Acme Consulting",
      dashboard_url: "https://app.chamberforge.com",
      unsubscribe_url: "#",
    },
  },
  onboarding_step_1: {
    subject: "Getting Started: Your First Problem Discovery",
    sampleVars: {
      name: "Jane Doe",
      action_url: "https://app.chamberforge.com/onboarding/1",
      unsubscribe_url: "#",
    },
  },
  onboarding_step_2: {
    subject: "Build Your First Offer",
    sampleVars: {
      name: "Jane Doe",
      action_url: "https://app.chamberforge.com/onboarding/2",
      unsubscribe_url: "#",
    },
  },
  onboarding_step_3: {
    subject: "Activate a Playbook",
    sampleVars: {
      name: "Jane Doe",
      action_url: "https://app.chamberforge.com/onboarding/3",
      unsubscribe_url: "#",
    },
  },
  deliverable_ready: {
    subject: "Your {deliverable_type} is Ready",
    sampleVars: {
      name: "Jane Doe",
      deliverable_type: "Strategy Report",
      client_name: "Smith Holdings",
      download_url: "https://app.chamberforge.com/downloads/123",
      unsubscribe_url: "#",
    },
  },
  alert_critical: {
    subject: "Critical Alert: {alert_title}",
    sampleVars: {
      alert_title: "Payment Processing Down",
      alert_message:
        "The payment gateway has been unreachable for 5 minutes.",
      action_url: "https://app.chamberforge.com/alerts/456",
      unsubscribe_url: "#",
    },
  },
  alert_warning: {
    subject: "Attention Required: {alert_title}",
    sampleVars: {
      alert_title: "Client Engagement Low",
      alert_message: "3 clients have not logged in for 30+ days.",
      action_url: "https://app.chamberforge.com/alerts/789",
      unsubscribe_url: "#",
    },
  },
  invoice: {
    subject: "Invoice #{invoice_number} — {amount}",
    sampleVars: {
      name: "Jane Doe",
      invoice_number: "INV-2026-0042",
      amount: "$15,000",
      due_date: "May 1, 2026",
      payment_url: "https://app.chamberforge.com/pay/42",
      unsubscribe_url: "#",
    },
  },
  renewal_reminder: {
    subject: "Upcoming Renewal: {offer_name}",
    sampleVars: {
      name: "Jane Doe",
      offer_name: "Premium Advisory Retainer",
      renewal_date: "June 1, 2026",
      manage_url: "https://app.chamberforge.com/subscriptions",
      unsubscribe_url: "#",
    },
  },
  weekly_digest: {
    subject: "Your Weekly ChamberForge Digest",
    sampleVars: {
      name: "Jane Doe",
      workspace_name: "Acme Consulting",
      new_clients: "3",
      deliverables_completed: "7",
      revenue: "$42,500",
      dashboard_url: "https://app.chamberforge.com",
      unsubscribe_url: "#",
    },
  },
};

function substituteVars(
  template: string,
  vars: Record<string, string>
): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) =>
      result.replaceAll(`{${key}}`, value),
    template
  );
}

export default function EmailTemplatePreview() {
  const templateNames = Object.keys(TEMPLATES);
  const [selected, setSelected] = useState(templateNames[0]);
  const [customVars, setCustomVars] = useState<Record<string, string>>({});

  const templateMeta = TEMPLATES[selected];
  const activeVars = { ...templateMeta.sampleVars, ...customVars };

  const renderedSubject = useMemo(
    () => substituteVars(templateMeta.subject, activeVars),
    [selected, activeVars]
  );

  function handleVarChange(key: string, value: string) {
    setCustomVars((prev) => ({ ...prev, [key]: value }));
  }

  function handleTemplateChange(name: string) {
    setSelected(name);
    setCustomVars({});
  }

  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-zinc-800 bg-zinc-900/60">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">
          Email Template Preview
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Select a template and customize variables to preview the rendered
          output.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-6 lg:flex-row">
        {/* Sidebar: template selector + variables */}
        <div className="w-full space-y-4 lg:w-72">
          {/* Template selector */}
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Template
            </label>
            <select
              value={selected}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            >
              {templateNames.map((name) => (
                <option key={name} value={name}>
                  {name.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Variable editor */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Variables
            </label>
            <div className="space-y-2">
              {Object.entries(templateMeta.sampleVars).map(
                ([key, defaultVal]) => (
                  <div key={key}>
                    <label className="mb-0.5 block text-xs text-zinc-500">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={customVars[key] ?? defaultVal}
                      onChange={(e) => handleVarChange(key, e.target.value)}
                      className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Preview pane */}
        <div className="flex-1">
          {/* Subject line */}
          <div className="mb-3 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2">
            <span className="text-xs text-zinc-500">Subject: </span>
            <span className="text-sm font-medium text-white">
              {renderedSubject}
            </span>
          </div>

          {/* Body preview placeholder */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-bold text-violet-400">
                ChamberForge
              </h3>
              <hr className="border-zinc-800" />
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-300">
              <p>
                <strong className="text-white">To:</strong>{" "}
                {activeVars.name ?? "Recipient"}
              </p>
              <p className="text-zinc-400">
                Template:{" "}
                <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-violet-400">
                  {selected}
                </code>
              </p>
              <div className="mt-4 rounded-lg border border-dashed border-zinc-700 p-4 text-xs text-zinc-500">
                <p className="mb-2 font-medium text-zinc-400">
                  Rendered variables:
                </p>
                {Object.entries(activeVars).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-zinc-600">{k}:</span>
                    <span className="text-zinc-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
