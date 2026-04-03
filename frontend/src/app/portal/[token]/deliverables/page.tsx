"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const portalApi = (path: string) => fetch(`${API_BASE}${path}`);

interface Deliverable {
  id: string;
  name: string;
  type: string;
  size_bytes: number;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const typeLabels: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  xlsx: "XLSX",
  pptx: "PPTX",
};

export default function DeliverablesPage() {
  const params = useParams();
  const token = params.token as string;
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi(`/api/v1/portal/${token}/deliverables`)
      .then((res) => res.json())
      .then((data) => setDeliverables(data.deliverables))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="py-16 text-center text-gray-400">Loading deliverables...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Deliverables</h1>
      <p className="text-gray-500 mb-8">All documents and files prepared for you.</p>

      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
        {deliverables.map((d) => (
          <div key={d.id} className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-500">
                  {typeLabels[d.type] || d.type.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{d.name}</div>
                <div className="text-sm text-gray-400 mt-0.5">
                  {formatBytes(d.size_bytes)} &middot; {formatDate(d.created_at)}
                </div>
              </div>
            </div>
            <a
              href={`${API_BASE}/api/v1/portal/${token}/download/${d.id}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Download
            </a>
          </div>
        ))}

        {deliverables.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-400">
            No deliverables available yet.
          </div>
        )}
      </div>
    </div>
  );
}
