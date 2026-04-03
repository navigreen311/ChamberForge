"use client";

import { useEffect, useState } from "react";

interface QueueItem {
  id: string;
  source_url: string;
  source_type: string;
  credibility_score: number;
  extracted_claims: Array<Record<string, unknown>>;
  contradiction_flags: Array<Record<string, unknown>>;
  publication_date: string;
}

interface AnalystQueueProps {
  workspaceId: string;
  apiBase?: string;
  onApprove?: (id: string) => void;
  onFlag?: (id: string) => void;
}

export default function AnalystQueue({
  workspaceId,
  apiBase = "http://localhost:8000",
  onApprove,
  onFlag,
}: AnalystQueueProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, [workspaceId]);

  async function fetchQueue() {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/api/v1/evidence/analyst-queue?workspace_id=${workspaceId}`
      );
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch analyst queue:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleApprove(id: string) {
    if (onApprove) {
      onApprove(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleFlag(id: string) {
    if (onFlag) {
      onFlag(id);
    }
  }

  function credibilityColor(score: number) {
    if (score < 4) return "text-red-600";
    if (score <= 7) return "text-yellow-600";
    return "text-green-600";
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading queue...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg bg-green-50">
        No items need review. All clear.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-amber-50 border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-amber-800">
          Analyst Review Queue ({items.length} items)
        </h2>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
              Source
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
              Type
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
              Credibility
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
              Issues
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-800 truncate max-w-[200px]">
                {item.source_url}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                  {item.source_type.replace(/_/g, " ")}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-sm font-bold ${credibilityColor(item.credibility_score)}`}
                >
                  {item.credibility_score.toFixed(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {item.credibility_score < 5 && (
                  <span className="inline-block px-1.5 py-0.5 bg-red-100 text-red-700 rounded mr-1">
                    Low credibility
                  </span>
                )}
                {item.contradiction_flags?.length > 0 && (
                  <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                    {item.contradiction_flags.length} contradiction
                    {item.contradiction_flags.length > 1 ? "s" : ""}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleFlag(item.id)}
                  className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Flag
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
