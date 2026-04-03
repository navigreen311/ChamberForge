"use client";

import { useEffect, useState } from "react";
import GuardrailsBadge from "@/components/modules/GuardrailsBadge";

interface RiskItem {
  id: string;
  item_type: string;
  item_id: string;
  risk_level: string;
  reason: string;
  status: string;
  reviewer_id: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string | null;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Placeholder workspace — in production would come from auth context
const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
const REVIEWER_ID = "00000000-0000-0000-0000-000000000099";

function riskToBadge(level: string): "PASS" | "WARN" | "BLOCK" {
  if (level === "low") return "PASS";
  if (level === "critical" || level === "high") return "BLOCK";
  return "WARN";
}

export default function RiskQueuePage() {
  const [items, setItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/v1/qualify/risk-queue?workspace_id=${WORKSPACE_ID}&status=pending`,
      );
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const doAction = async (
    itemId: string,
    action: "approve" | "reject" | "escalate",
  ) => {
    const bodies: Record<string, object> = {
      approve: { reviewer_id: REVIEWER_ID, notes: "Approved via UI" },
      reject: { reviewer_id: REVIEWER_ID, reason: "Rejected via UI" },
      escalate: { note: "Escalated via UI" },
    };
    await fetch(`${API}/api/v1/qualify/risk-queue/${itemId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodies[action]),
    });
    fetchQueue();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <h1 className="text-2xl font-bold text-white">Risk Review Queue</h1>

      {loading ? (
        <p className="text-white/40">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-white/40">No pending items.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 text-white/70"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {item.item_type}
                  </td>
                  <td className="px-4 py-3">
                    <GuardrailsBadge
                      status={riskToBadge(item.risk_level)}
                      label={item.risk_level}
                    />
                  </td>
                  <td className="max-w-xs truncate px-4 py-3">
                    {item.reason}
                  </td>
                  <td className="px-4 py-3 capitalize">{item.status}</td>
                  <td className="flex gap-2 px-4 py-3">
                    <button
                      onClick={() => doAction(item.id, "approve")}
                      className="rounded bg-emerald-600/80 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => doAction(item.id, "reject")}
                      className="rounded bg-red-600/80 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => doAction(item.id, "escalate")}
                      className="rounded bg-amber-600/80 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-500"
                    >
                      Escalate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
