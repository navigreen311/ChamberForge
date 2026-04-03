"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Report {
  id: string;
  title: string;
  period: string;
  type: string;
  created_at: string;
  summary: string;
}

const typeLabels: Record<string, string> = {
  scorecard: "Scorecard",
  quarterly_review: "Quarterly Review",
  annual_report: "Annual Report",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReportsPage() {
  const params = useParams();
  const token = params.token as string;
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/portal/${token}/reports`)
      .then((res) => res.json())
      .then((data) => setReports(data.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="py-16 text-center text-gray-400">Loading reports...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
      <p className="text-gray-500 mb-8">Quarterly scorecards, reviews, and annual reports.</p>

      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{report.title}</h3>
                <div className="flex gap-3 mt-1 text-sm text-gray-400">
                  <span>{report.period}</span>
                  <span>&middot;</span>
                  <span>{typeLabels[report.type] || report.type}</span>
                  <span>&middot;</span>
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </div>
              <a
                href={`${API_BASE}/api/v1/portal/${token}/download/${report.id}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Download
              </a>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{report.summary}</p>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="py-12 text-center text-gray-400 rounded-xl border border-gray-200">
            No reports available yet.
          </div>
        )}
      </div>
    </div>
  );
}
