"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import FileUploader from "@/components/modules/FileUploader";
import DocumentViewer from "@/components/modules/DocumentViewer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

interface DocRecord {
  id: string;
  file_name: string;
  file_type: string;
  size_bytes: number;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${units[i]}`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerFile, setViewerFile] = useState<{ name: string; type: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get(`/api/v1/storage/files?workspace_id=${WORKSPACE_ID}`);
      setDocuments(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (doc: DocRecord) => {
    try {
      const res = await api.get(`/api/v1/storage/files/${doc.id}/download`);
      const { url } = res.data;
      setViewerUrl(url);
      setViewerFile({ name: doc.file_name, type: doc.file_type });
    } catch (err: any) {
      setError(`Download error: ${err?.response?.data?.detail || err?.message}`);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document permanently?")) return;
    setDeleting(docId);
    try {
      await api.delete(`/api/v1/storage/files/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      setError(`Delete error: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <h1 className="mb-8 text-2xl font-bold text-white">Document Management</h1>

      {error && (
        <div className="mb-6 rounded-xl bg-red-400/10 border border-red-400/30 p-4 text-red-400">{error}</div>
      )}

      {/* Upload section */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-chamber-200">Upload Document</h2>
        <FileUploader
          workspaceId={WORKSPACE_ID}
          apiBase={API_BASE}
          onUploadComplete={() => fetchDocuments()}
        />
      </section>

      {/* Viewer */}
      {viewerUrl && viewerFile && (
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-chamber-200">Preview</h2>
            <button
              onClick={() => { setViewerUrl(null); setViewerFile(null); }}
              className="text-sm text-chamber-400 hover:text-white"
            >
              Close preview
            </button>
          </div>
          <DocumentViewer url={viewerUrl} fileName={viewerFile.name} fileType={viewerFile.type} />
        </section>
      )}

      {/* Documents table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-chamber-200">Files</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-chamber-600 border-t-blue-400" />
          </div>
        ) : documents.length === 0 ? (
          <p className="py-12 text-center text-sm text-chamber-500">No documents uploaded yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-chamber-700">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-chamber-700 bg-chamber-900">
                <tr>
                  <th className="px-4 py-3 font-medium text-chamber-400">Name</th>
                  <th className="px-4 py-3 font-medium text-chamber-400">Type</th>
                  <th className="px-4 py-3 font-medium text-chamber-400">Size</th>
                  <th className="px-4 py-3 font-medium text-chamber-400">Uploaded</th>
                  <th className="px-4 py-3 font-medium text-chamber-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chamber-800">
                {documents.map((doc) => (
                  <tr key={doc.id} className="bg-chamber-950 transition-colors hover:bg-chamber-900">
                    <td className="px-4 py-3 text-chamber-200">{doc.file_name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-chamber-800 px-2 py-0.5 text-xs text-chamber-400">
                        {doc.file_type.split("/").pop()?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-chamber-300">{formatBytes(doc.size_bytes)}</td>
                    <td className="px-4 py-3 text-chamber-400">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="flex gap-2 px-4 py-3">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="rounded-lg bg-chamber-800 px-3 py-1 text-xs text-chamber-300 hover:bg-chamber-700 hover:text-white"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                        className="rounded-lg bg-red-950 px-3 py-1 text-xs text-red-400 hover:bg-red-900 hover:text-red-300 disabled:opacity-50"
                      >
                        {deleting === doc.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
