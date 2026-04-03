"use client";

import { useState, useEffect } from "react";

const slaMetrics = [
  { name: "First Response Time", target: "< 2 hours", actual: "1.4 hours", compliance: 96, history: [94, 95, 93, 96, 97, 96] },
  { name: "Issue Resolution Time", target: "< 24 hours", actual: "18.2 hours", compliance: 88, history: [85, 87, 86, 88, 90, 88] },
  { name: "Client Satisfaction (CSAT)", target: "> 90%", actual: "94%", compliance: 94, history: [91, 92, 93, 93, 94, 94] },
  { name: "Service Uptime", target: "99.9%", actual: "99.95%", compliance: 100, history: [99, 100, 99, 100, 100, 100] },
  { name: "Data Accuracy", target: "> 97%", actual: "98.2%", compliance: 98, history: [96, 97, 97, 98, 98, 98] },
  { name: "Consent Coverage", target: "100%", actual: "90%", compliance: 90, history: [82, 84, 86, 88, 89, 90] },
];

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function QualityPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/compliance" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Compliance</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Service Quality</h1>
      <p className="text-chamber-400 mb-8">SLA performance monitoring and quality metrics dashboard</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          ["Overall SLA Compliance", "94.3%", slaMetrics.filter(m => m.compliance >= 95).length >= 4 ? "text-green-400" : "text-gold-400"],
          ["Metrics Meeting Target", `${slaMetrics.filter(m => m.compliance >= 95).length}/${slaMetrics.length}`, "text-blue-400"],
          ["Needs Attention", slaMetrics.filter(m => m.compliance < 95).length.toString(), "text-red-400"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className={`text-2xl font-bold ${c}`}>{String(v)}</p>
          </div>
        ))}
      </div>

      {/* SLA Cards with Mini Charts */}
      <div className="space-y-4">
        {slaMetrics.map((m) => (
          <div key={m.name} className={`bg-chamber-900 rounded-xl p-6 border ${m.compliance >= 95 ? "border-chamber-800" : "border-gold-400/30"}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">{m.name}</h3>
                <p className="text-sm text-chamber-500">Target: {m.target}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{m.actual}</p>
                <span className={`text-sm font-medium ${m.compliance >= 95 ? "text-green-400" : m.compliance >= 90 ? "text-gold-400" : "text-red-400"}`}>{m.compliance}% compliant</span>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="flex items-end gap-2 h-12">
              {m.history.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-t ${v >= 95 ? "bg-green-400/60" : v >= 90 ? "bg-gold-400/60" : "bg-red-400/60"}`} style={{ height: `${(v / 100) * 100}%` }} />
                  <span className="text-xs text-chamber-600">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
