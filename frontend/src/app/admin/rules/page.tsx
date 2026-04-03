"use client";

import { useState, useEffect } from "react";

const initialRules = [
  { id: 1, name: "Low Health Alert", trigger: "Client health drops below 70", action: "Send alert to account manager + schedule check-in", enabled: true, lastFired: "2026-04-01" },
  { id: 2, name: "Payment Overdue Escalation", trigger: "Invoice unpaid after 7 days", action: "Escalate to billing team + pause non-essential services", enabled: true, lastFired: "2026-03-28" },
  { id: 3, name: "Consent Expiry Warning", trigger: "Consent record expires in 14 days", action: "Notify compliance team + send renewal request to client", enabled: true, lastFired: "2026-04-02" },
  { id: 4, name: "High-Value Lead Detection", trigger: "New problem scores 85+ on validation", action: "Auto-assign to Scout agent + notify sales team", enabled: true, lastFired: "2026-03-30" },
  { id: 5, name: "SLA Breach Prevention", trigger: "Support ticket approaches 20-hour mark", action: "Escalate to senior team + send apology template", enabled: false, lastFired: "2026-03-15" },
  { id: 6, name: "Competitor Alert", trigger: "Competitor outreach detected to existing client", action: "Generate retention intel brief + alert account manager", enabled: true, lastFired: "Never" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RulesPage() {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", trigger: "", action: "" });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const toggleRule = (id: number) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const addRule = () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) return;
    setRules((prev) => [...prev, { id: prev.length + 1, ...newRule, enabled: true, lastFired: "Never" }]);
    setNewRule({ name: "", trigger: "", action: "" });
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Rules Builder</h1>
          <p className="text-chamber-400">Automate workflows with trigger-action rules</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">
          {showForm ? "Cancel" : "New Rule"}
        </button>
      </div>

      {/* New Rule Form */}
      {showForm && (
        <div className="bg-chamber-900 rounded-xl p-6 border border-gold-400/30 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Rule</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Rule Name</label>
              <input type="text" value={newRule.name} onChange={(e) => setNewRule({ ...newRule, name: e.target.value })} placeholder="e.g., High Churn Risk Alert" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Trigger (When...)</label>
              <input type="text" value={newRule.trigger} onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })} placeholder="e.g., Client health drops below 50" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <div>
              <label className="text-sm text-chamber-300 mb-1 block">Action (Then...)</label>
              <input type="text" value={newRule.action} onChange={(e) => setNewRule({ ...newRule, action: e.target.value })} placeholder="e.g., Send urgent alert to team lead" className="w-full bg-chamber-800 border border-chamber-700 rounded-lg px-4 py-2.5 text-white placeholder-chamber-500 focus:outline-none focus:border-gold-400" />
            </div>
            <button onClick={addRule} className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Create Rule</button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((r) => (
          <div key={r.id} className={`bg-chamber-900 rounded-xl p-5 border ${r.enabled ? "border-chamber-800" : "border-chamber-800 opacity-50"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold">{r.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${r.enabled ? "bg-green-400/20 text-green-400" : "bg-chamber-700 text-chamber-400"}`}>{r.enabled ? "Active" : "Disabled"}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gold-400 text-xs font-semibold">WHEN: </span>
                    <span className="text-chamber-300">{r.trigger}</span>
                  </div>
                  <div>
                    <span className="text-blue-400 text-xs font-semibold">THEN: </span>
                    <span className="text-chamber-300">{r.action}</span>
                  </div>
                </div>
                <p className="text-xs text-chamber-600 mt-2">Last fired: {r.lastFired}</p>
              </div>
              <button onClick={() => toggleRule(r.id)} className={`relative w-12 h-6 rounded-full transition flex-shrink-0 ml-4 ${r.enabled ? "bg-gold-400" : "bg-chamber-700"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${r.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
