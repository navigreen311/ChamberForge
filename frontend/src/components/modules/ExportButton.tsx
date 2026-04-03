"use client";

import { useCallback, useRef, useState } from "react";

type ExportFormat = "pdf" | "json" | "csv";

interface ExportButtonProps {
  /** The entity type being exported (offer, trust-pack, intel-brief). */
  entityType: "offer" | "trust-pack" | "intel-brief";
  /** The entity ID to export. */
  entityId: string;
  /** Current user ID (required for watermarked PDFs). */
  userId: string;
  /** Workspace ID. */
  workspaceId?: string;
  /** Raw data for JSON/CSV export. */
  data?: Record<string, unknown>;
  apiBase?: string;
}

export default function ExportButton({
  entityType,
  entityId,
  userId,
  workspaceId = "default",
  data,
  apiBase = "http://localhost:8000",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const exportPdf = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${apiBase}/api/v1/exports/${entityType}/${entityId}?user_id=${userId}&workspace_id=${workspaceId}`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${entityType}-${entityId}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, [apiBase, entityType, entityId, userId, workspaceId]);

  const exportJson = useCallback(() => {
    const payload = data ?? { id: entityId, type: entityType };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${entityType}-${entityId}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setOpen(false);
  }, [data, entityId, entityType]);

  const exportCsv = useCallback(() => {
    const payload = data ?? { id: entityId, type: entityType };
    const headers = Object.keys(payload).join(",");
    const values = Object.values(payload)
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
    const csv = `${headers}\n${values}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${entityType}-${entityId}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setOpen(false);
  }, [data, entityId, entityType]);

  const formats: { label: string; format: ExportFormat; action: () => void }[] = [
    { label: "PDF (watermarked)", format: "pdf", action: exportPdf },
    { label: "JSON", format: "json", action: exportJson },
    { label: "CSV", format: "csv", action: exportCsv },
  ];

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
        Export
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-chamber-700 bg-chamber-900 shadow-xl">
          {formats.map(({ label, format, action }) => (
            <button
              key={format}
              onClick={action}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-chamber-200 transition-colors hover:bg-chamber-800"
            >
              <span className="rounded bg-chamber-700 px-1.5 py-0.5 text-xs font-mono text-chamber-400">
                {format.toUpperCase()}
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
