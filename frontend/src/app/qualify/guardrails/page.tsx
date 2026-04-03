"use client";

import { useState, useEffect } from "react";

const guardrailChecks = [
  { id: 1, name: "Ethical Compliance", description: "Ensures the service offering does not exploit vulnerable populations", status: "pass", details: "No exploitative pricing patterns detected. Service targets informed, affluent buyers." },
  { id: 2, name: "Regulatory Alignment", description: "Verifies compliance with relevant industry regulations", status: "pass", details: "FAA Part 135 requirements identified and documented. EU-OPS considerations flagged for international routes." },
  { id: 3, name: "Data Privacy (GDPR/CCPA)", description: "Checks data handling practices against privacy regulations", status: "warning", details: "Client data collection plan requires explicit consent mechanism. Recommend adding opt-in forms before launch." },
  { id: 4, name: "Anti-Money Laundering (AML)", description: "Screens for AML risk factors in target market", status: "pass", details: "Standard KYC procedures sufficient for this service category. No elevated AML risk detected." },
  { id: 5, name: "Conflict of Interest", description: "Identifies potential conflicts between clients or services", status: "pass", details: "No conflicting service offerings detected across current client portfolio." },
  { id: 6, name: "Service Capacity Check", description: "Validates ability to deliver promised service levels", status: "fail", details: "Current vendor network covers 60% of target markets. Expand partnerships in Dubai and Singapore before launch." },
  { id: 7, name: "Insurance Coverage", description: "Verifies adequate professional liability coverage", status: "warning", details: "Current E&O policy covers general advisory. Aviation-specific endorsement recommended ($2M additional)." },
  { id: 8, name: "Reputation Risk", description: "Assesses brand and reputational risk factors", status: "pass", details: "No adverse media or reputation signals. Market entry aligns with brand positioning." },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function GuardrailsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const passCount = guardrailChecks.filter((c) => c.status === "pass").length;
  const warnCount = guardrailChecks.filter((c) => c.status === "warning").length;
  const failCount = guardrailChecks.filter((c) => c.status === "fail").length;

  if (loading) {
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
        {guardrailChecks.map((check) => (
          <div key={check.id} className={`bg-chamber-900 rounded-xl p-5 border ${
            check.status === "pass" ? "border-green-400/20" :
            check.status === "warning" ? "border-gold-400/20" :
            "border-red-400/20"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                check.status === "pass" ? "bg-green-400/20 text-green-400" :
                check.status === "warning" ? "bg-gold-400/20 text-gold-400" :
                "bg-red-400/20 text-red-400"
              }`}>
                {check.status === "pass" ? "✓" : check.status === "warning" ? "!" : "✗"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{check.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    check.status === "pass" ? "bg-green-400/20 text-green-400" :
                    check.status === "warning" ? "bg-gold-400/20 text-gold-400" :
                    "bg-red-400/20 text-red-400"
                  }`}>{check.status.toUpperCase()}</span>
                </div>
                <p className="text-sm text-chamber-500 mb-2">{check.description}</p>
                <p className="text-sm text-chamber-300">{check.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <button className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Acknowledge & Proceed</button>
        <button className="px-5 py-2.5 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition">Re-run Checks</button>
      </div>
    </div>
  );
}
