"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Rule {
  id: string | number;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  last_fired?: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RulesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", trigger: "", action: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchRules() {
      try {
        const res = await api.get("/api/v1/primitives/rules");
        setRules(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load rules");
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  const addRule = async () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) return;
    setCreating(true);
    try {
      const res = await api.post("/api/v1/primitives/rules", newRule);
      setRules((prev) => [...prev, res.data]);
      setNewRule({ name: "", trigger: "", action: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(`Failed to create rule: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleRule = (id: string | number) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
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

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 mb-6">{error}</div>
      )}

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
            <button onClick={addRule} disabled={creating} className="px-5 py-2.5 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition disabled:opacity-50">
              {creating ? "Creating..." : "Create Rule"}
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="bg-chamber-900 rounded-xl p-8 border border-chamber-800 text-center text-chamber-500">No rules found. Create one to get started.</div>
      ) : (
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
                  {r.last_fired && <p className="text-xs text-chamber-600 mt-2">Last fired: {r.last_fired}</p>}
                </div>
                <button onClick={() => toggleRule(r.id)} className={`relative w-12 h-6 rounded-full transition flex-shrink-0 ml-4 ${r.enabled ? "bg-gold-400" : "bg-chamber-700"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${r.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
