"use client";

import { useState, useEffect } from "react";

const metrics = [
  { label: "Active Problems", value: "47", change: "+12%", up: true },
  { label: "Qualified Leads", value: "18", change: "+8%", up: true },
  { label: "Pipeline Value", value: "$2.4M", change: "+22%", up: true },
  { label: "Client Health", value: "94%", change: "-1%", up: false },
];

const agents = [
  { name: "Scout", status: "active", task: "Scanning 3 new markets" },
  { name: "Analyst", status: "active", task: "Validating luxury concierge" },
  { name: "Strategist", status: "idle", task: "Awaiting next brief" },
  { name: "Copywriter", status: "active", task: "Drafting outreach for 2 leads" },
  { name: "Compliance", status: "active", task: "Reviewing consent records" },
  { name: "Monitor", status: "idle", task: "All clients healthy" },
];

const opportunities = [
  { id: 1, name: "Private Aviation Concierge", stage: "Qualified", value: "$340K", score: 92, owner: "You" },
  { id: 2, name: "Estate Management Platform", stage: "Discovery", value: "$180K", score: 78, owner: "You" },
  { id: 3, name: "Family Office Tax Advisory", stage: "Build", value: "$520K", score: 88, owner: "Team" },
  { id: 4, name: "Yacht Crew Staffing", stage: "Discovery", value: "$95K", score: 65, owner: "You" },
  { id: 5, name: "Art Collection Insurance", stage: "Qualified", value: "$210K", score: 81, owner: "Team" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <h1 className="text-3xl font-display font-bold text-white mb-1">Command Dashboard</h1>
      <p className="text-chamber-400 mb-8">Your AI-powered operating view — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

      {/* Next Action Card */}
      <div className="border-2 border-gold-400 rounded-xl p-6 mb-8 bg-chamber-900/50">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Next Recommended Action</span>
          <span className="px-2 py-0.5 bg-gold-400/20 text-gold-400 text-xs rounded-full">AI Suggested</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Follow up on Private Aviation Concierge lead</h2>
        <p className="text-chamber-300 mb-4">Your Analyst agent validated this opportunity with a 92/100 score. Two decision-makers responded to outreach yesterday.</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition">Take Action</button>
          <button className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition">Snooze</button>
          <button className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition">Dismiss</button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
            <p className="text-chamber-400 text-sm mb-1">{m.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-white">{m.value}</span>
              <span className={`text-sm ${m.up ? "text-green-400" : "text-red-400"}`}>{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Grid + Daily Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">AI Agent Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agents.map((a) => (
              <div key={a.name} className="bg-chamber-900 rounded-lg p-4 border border-chamber-800 flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${a.status === "active" ? "bg-green-400 animate-pulse" : "bg-chamber-500"}`} />
                <div>
                  <p className="font-semibold text-white">{a.name}</p>
                  <p className="text-sm text-chamber-400">{a.task}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Daily Brief</h3>
          <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800 space-y-4">
            <div>
              <p className="text-gold-400 text-xs font-semibold uppercase mb-1">Market Signal</p>
              <p className="text-sm text-chamber-300">Luxury concierge demand up 18% in Q1 filings.</p>
            </div>
            <div>
              <p className="text-gold-400 text-xs font-semibold uppercase mb-1">Client Alert</p>
              <p className="text-sm text-chamber-300">Henderson family office contract renewal in 14 days.</p>
            </div>
            <div>
              <p className="text-gold-400 text-xs font-semibold uppercase mb-1">Compliance</p>
              <p className="text-sm text-chamber-300">3 consent records expiring this week — review needed.</p>
            </div>
            <div>
              <p className="text-gold-400 text-xs font-semibold uppercase mb-1">Revenue</p>
              <p className="text-sm text-chamber-300">MRR grew to $142K, on track for quarterly target.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <h3 className="text-lg font-semibold text-white mb-4">Active Opportunities</h3>
      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Opportunity</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Stage</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Value</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Score</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Owner</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.id} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                <td className="px-5 py-4 text-white font-medium">{o.name}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    o.stage === "Qualified" ? "bg-green-400/20 text-green-400" :
                    o.stage === "Build" ? "bg-blue-400/20 text-blue-400" :
                    "bg-gold-400/20 text-gold-400"
                  }`}>{o.stage}</span>
                </td>
                <td className="px-5 py-4 text-chamber-300">{o.value}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-chamber-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-400 rounded-full" style={{ width: `${o.score}%` }} />
                    </div>
                    <span className="text-sm text-chamber-300">{o.score}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-chamber-400">{o.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
