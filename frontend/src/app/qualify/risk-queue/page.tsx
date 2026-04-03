"use client";

import { useState, useEffect } from "react";

const initialItems = [
  { id: 1, type: "Problem", item: "Cryptocurrency Custody for Family Offices", risk: "High", reason: "Regulatory uncertainty in 3 target jurisdictions", flaggedBy: "Compliance Agent", date: "2026-04-02", status: "pending" as const },
  { id: 2, type: "Evidence", item: "Anonymous forum post on yacht insurance fraud", risk: "Medium", reason: "Low credibility source — requires manual verification", flaggedBy: "Scout Agent", date: "2026-04-01", status: "pending" as const },
  { id: 3, type: "Offer", item: "Estate Staff Placement — Accelerated Package", risk: "High", reason: "Pricing below cost-of-delivery threshold", flaggedBy: "Strategist Agent", date: "2026-03-31", status: "pending" as const },
  { id: 4, type: "Client", item: "Meridian Holdings LLC", risk: "Critical", reason: "AML screening returned partial match — manual review required", flaggedBy: "Compliance Agent", date: "2026-03-30", status: "pending" as const },
  { id: 5, type: "Marketing", item: "Outreach template: Private Aviation Intro", risk: "Low", reason: "Tone flagged as potentially too aggressive for UHNW audience", flaggedBy: "Copywriter Agent", date: "2026-03-29", status: "pending" as const },
  { id: 6, type: "Problem", item: "Pet Care Concierge for Estate Owners", risk: "Low", reason: "Market size below minimum threshold ($500K TAM)", flaggedBy: "Analyst Agent", date: "2026-03-28", status: "pending" as const },
];

type ItemStatus = "pending" | "approved" | "rejected";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RiskQueuePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<{ id: number; type: string; item: string; risk: string; reason: string; flaggedBy: string; date: string; status: ItemStatus }>>(initialItems);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const updateStatus = (id: number, status: ItemStatus) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const pending = items.filter((i) => i.status === "pending");

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/qualify" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Qualify</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Risk Queue</h1>
      <p className="text-chamber-400 mb-2">Items flagged by AI agents requiring human review</p>
      <p className="text-sm text-chamber-500 mb-8">{pending.length} items pending review</p>

      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Item</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Risk</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Reason</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Flagged By</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-xs font-semibold text-chamber-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={`border-b border-chamber-800/50 transition ${item.status !== "pending" ? "opacity-50" : "hover:bg-chamber-800/30"}`}>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 rounded text-xs bg-chamber-800 text-chamber-300">{item.type}</span>
                </td>
                <td className="px-5 py-4 text-white font-medium text-sm">{item.item}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.risk === "Critical" ? "bg-red-500/20 text-red-400" :
                    item.risk === "High" ? "bg-orange-400/20 text-orange-400" :
                    item.risk === "Medium" ? "bg-gold-400/20 text-gold-400" :
                    "bg-blue-400/20 text-blue-400"
                  }`}>{item.risk}</span>
                </td>
                <td className="px-5 py-4 text-sm text-chamber-400 max-w-xs">{item.reason}</td>
                <td className="px-5 py-4 text-sm text-chamber-400">{item.flaggedBy}</td>
                <td className="px-5 py-4 text-sm text-chamber-500">{item.date}</td>
                <td className="px-5 py-4">
                  {item.status === "pending" ? (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(item.id, "approved")} className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-lg hover:bg-green-400/30 transition">Approve</button>
                      <button onClick={() => updateStatus(item.id, "rejected")} className="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded-lg hover:bg-red-400/30 transition">Reject</button>
                    </div>
                  ) : (
                    <span className={`text-xs font-medium ${item.status === "approved" ? "text-green-400" : "text-red-400"}`}>{item.status === "approved" ? "Approved" : "Rejected"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
