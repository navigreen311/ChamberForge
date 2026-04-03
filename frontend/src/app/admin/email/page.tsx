"use client";

import { useEffect, useState } from "react";

interface EmailHistoryItem {
  id: string;
  to_email: string;
  template: string | null;
  subject: string;
  status: "sent" | "delivered" | "bounced" | "failed";
  sent_at: string;
}

interface DeliveryStats {
  total: number;
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  deliveryRate: string;
}

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-500/20 text-blue-400",
  delivered: "bg-emerald-500/20 text-emerald-400",
  bounced: "bg-amber-500/20 text-amber-400",
  failed: "bg-red-500/20 text-red-400",
};

export default function EmailDashboardPage() {
  const [history, setHistory] = useState<EmailHistoryItem[]>([]);
  const [stats, setStats] = useState<DeliveryStats>({
    total: 0,
    sent: 0,
    delivered: 0,
    bounced: 0,
    failed: 0,
    deliveryRate: "0%",
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    fetchHistory();
  }, [page]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(
        `${apiBase}/api/v1/email/history?page=${page}&page_size=${pageSize}`
      );
      const data = await res.json();

      setHistory(data.items ?? []);
      setTotal(data.total ?? 0);

      // Compute stats from history items
      const items: EmailHistoryItem[] = data.items ?? [];
      const sent = items.filter((i) => i.status === "sent").length;
      const delivered = items.filter((i) => i.status === "delivered").length;
      const bounced = items.filter((i) => i.status === "bounced").length;
      const failed = items.filter((i) => i.status === "failed").length;
      const totalItems = items.length;
      const rate =
        totalItems > 0
          ? ((delivered / totalItems) * 100).toFixed(1) + "%"
          : "N/A";

      setStats({
        total: totalItems,
        sent,
        delivered,
        bounced,
        failed,
        deliveryRate: rate,
      });
    } catch (err) {
      console.error("Failed to fetch email history:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Email Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Monitor transactional email delivery and performance.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Sent", value: stats.total, color: "text-white" },
            { label: "Sent", value: stats.sent, color: "text-blue-400" },
            {
              label: "Delivered",
              value: stats.delivered,
              color: "text-emerald-400",
            },
            { label: "Bounced", value: stats.bounced, color: "text-amber-400" },
            { label: "Failed", value: stats.failed, color: "text-red-400" },
            {
              label: "Delivery Rate",
              value: stats.deliveryRate,
              color: "text-violet-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
              <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* History Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Send History</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-500">
              Loading...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <p className="text-lg">No emails sent yet</p>
              <p className="mt-1 text-sm">
                Emails will appear here once sent via the API.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">To</th>
                  <th className="px-6 py-3">Template</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-zinc-300">
                      {item.to_email}
                    </td>
                    <td className="px-6 py-3 text-zinc-400">
                      {item.template ?? "—"}
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-3 text-zinc-300">
                      {item.subject}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[item.status] ?? "text-zinc-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-zinc-500">
                      {new Date(item.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3">
              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 disabled:opacity-30"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
