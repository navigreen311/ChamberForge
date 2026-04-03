"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PortalData {
  client_id: string;
  deliverables: { id: string; name: string }[];
  kpis: { name: string; current: number; target: number; status: string }[];
  reports: { id: string; title: string; period: string }[];
}

export default function PortalLandingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPortal() {
      try {
        const [delRes, kpiRes, repRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/portal/${token}/deliverables`),
          fetch(`${API_BASE}/api/v1/portal/${token}/kpis`),
          fetch(`${API_BASE}/api/v1/portal/${token}/reports`),
        ]);

        if (!delRes.ok) {
          setError("This portal link is invalid or has expired.");
          return;
        }

        const [delData, kpiData, repData] = await Promise.all([
          delRes.json(),
          kpiRes.json(),
          repRes.json(),
        ]);

        setData({
          client_id: delData.client_id,
          deliverables: delData.deliverables,
          kpis: kpiData.kpis,
          reports: repData.reports,
        });
      } catch {
        setError("Failed to load portal data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadPortal();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-gray-400 text-lg">Loading your portal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Portal Unavailable</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const onTrack = data.kpis.filter((k) => k.status === "on_track").length;
  const atRisk = data.kpis.filter((k) => k.status === "at_risk").length;
  const behind = data.kpis.filter((k) => k.status === "behind").length;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Portal</h1>
        <p className="text-gray-500">
          Access your deliverables, track KPIs, and review reports all in one place.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          href={`/portal/${token}/deliverables`}
          className="rounded-xl border border-gray-200 p-6 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {data.deliverables.length}
          </div>
          <div className="text-sm text-gray-500 mb-3">Deliverables</div>
          <div className="text-xs text-gray-400">View all documents and downloads</div>
        </Link>

        <Link
          href={`/portal/${token}/kpis`}
          className="rounded-xl border border-gray-200 p-6 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <div className="flex gap-4 mb-1">
            <span className="text-4xl font-bold text-gray-900">{data.kpis.length}</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">Active KPIs</div>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600">{onTrack} on track</span>
            <span className="text-amber-600">{atRisk} at risk</span>
            <span className="text-red-600">{behind} behind</span>
          </div>
        </Link>

        <Link
          href={`/portal/${token}/reports`}
          className="rounded-xl border border-gray-200 p-6 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {data.reports.length}
          </div>
          <div className="text-sm text-gray-500 mb-3">Reports</div>
          <div className="text-xs text-gray-400">Quarterly scorecards and reviews</div>
        </Link>
      </div>

      {/* Recent Deliverables */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliverables</h2>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          {data.deliverables.slice(0, 3).map((d) => (
            <div key={d.id} className="px-5 py-4 flex items-center justify-between">
              <span className="text-gray-800 font-medium">{d.name}</span>
              <Link
                href={`/portal/${token}/deliverables`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Report */}
      {data.reports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Report</h2>
          <div className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-900">{data.reports[0].title}</h3>
            <p className="text-sm text-gray-500 mt-1">{data.reports[0].period}</p>
            <Link
              href={`/portal/${token}/reports`}
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              View all reports
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
