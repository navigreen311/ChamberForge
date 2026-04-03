"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface RiskItem {
  id: number | string;
  type: string;
  item: string;
  item_name?: string;
  risk: string;
  risk_level?: string;
  reason: string;
  flagged_by?: string;
  flaggedBy?: string;
  date: string;
  created_at?: string;
  status: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function RiskQueuePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RiskItem[]>([]);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/v1/qualify/risk-queue");
      const data = res.data;
      setItems(Array.isArray(data) ? data : data.items ?? data.results ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? "Failed to load risk queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id: number | string, action: "approve" | "reject") => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      await api.post(`/api/v1/qualify/risk-queue/${id}/${action}`);
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: action === "approve" ? "approved" : "rejected" } : item
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err.message ?? `Failed to ${action} item`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
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

      {error && (
        <div className="mb-6 p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

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
            {items.map((item) => {
              const riskLevel = item.risk ?? item.risk_level ?? "Unknown";
              const itemName = item.item ?? item.item_name ?? "—";
              const flaggedBy = item.flagged_by ?? item.flaggedBy ?? "—";
              const itemDate = item.date ?? item.created_at ?? "—";
              const isActioning = actionLoading[item.id] ?? false;
              return (
                <tr key={item.id} className={`border-b border-chamber-800/50 transition ${item.status !== "pending" ? "opacity-50" : "hover:bg-chamber-800/30"}`}>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-chamber-800 text-chamber-300">{item.type}</span>
                  </td>
                  <td className="px-5 py-4 text-white font-medium text-sm">{itemName}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      riskLevel === "Critical" ? "bg-red-500/20 text-red-400" :
                      riskLevel === "High" ? "bg-orange-400/20 text-orange-400" :
                      riskLevel === "Medium" ? "bg-gold-400/20 text-gold-400" :
                      "bg-blue-400/20 text-blue-400"
                    }`}>{riskLevel}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-chamber-400 max-w-xs">{item.reason}</td>
                  <td className="px-5 py-4 text-sm text-chamber-400">{flaggedBy}</td>
                  <td className="px-5 py-4 text-sm text-chamber-500">{itemDate}</td>
                  <td className="px-5 py-4">
                    {item.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(item.id, "approve")}
                          disabled={isActioning}
                          className="px-3 py-1 bg-green-400/20 text-green-400 text-xs rounded-lg hover:bg-green-400/30 transition disabled:opacity-50"
                        >
                          {isActioning ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "reject")}
                          disabled={isActioning}
                          className="px-3 py-1 bg-red-400/20 text-red-400 text-xs rounded-lg hover:bg-red-400/30 transition disabled:opacity-50"
                        >
                          {isActioning ? "..." : "Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-medium ${item.status === "approved" ? "text-green-400" : "text-red-400"}`}>
                        {item.status === "approved" ? "Approved" : "Rejected"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-chamber-500">No items in the risk queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
