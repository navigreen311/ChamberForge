"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface KPI {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "flat";
  status: "on_track" | "at_risk" | "behind";
}

const statusConfig = {
  on_track: { label: "On Track", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  at_risk: { label: "At Risk", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  behind: { label: "Behind", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const trendArrows = {
  up: { symbol: "\u2191", color: "text-green-600" },
  down: { symbol: "\u2193", color: "text-red-600" },
  flat: { symbol: "\u2192", color: "text-gray-400" },
};

function formatValue(value: number, unit: string): string {
  if (unit === "$") return `$${value.toLocaleString()}`;
  if (unit === "%") return `${value}%`;
  return `${value}`;
}

export default function KPIsPage() {
  const params = useParams();
  const token = params.token as string;
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/portal/${token}/kpis`)
      .then((res) => res.json())
      .then((data) => setKpis(data.kpis))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="py-16 text-center text-gray-400">Loading KPIs...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Key Performance Indicators</h1>
      <p className="text-gray-500 mb-8">Track progress against your targets in real time.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.map((kpi) => {
          const status = statusConfig[kpi.status];
          const trend = trendArrows[kpi.trend];
          const progress = Math.min(100, Math.round((kpi.current / kpi.target) * 100));

          return (
            <div
              key={kpi.name}
              className={`rounded-xl border ${status.border} ${status.bg} p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{kpi.name}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.text} ${status.bg}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatValue(kpi.current, kpi.unit)}
                </span>
                <span className={`text-lg ${trend.color}`}>{trend.symbol}</span>
                <span className="text-sm text-gray-400">
                  / {formatValue(kpi.target, kpi.unit)} target
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    kpi.status === "on_track"
                      ? "bg-green-500"
                      : kpi.status === "at_risk"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{progress}% complete</div>
            </div>
          );
        })}
      </div>

      {kpis.length === 0 && (
        <div className="py-12 text-center text-gray-400 rounded-xl border border-gray-200">
          No KPIs configured yet.
        </div>
      )}
    </div>
  );
}
