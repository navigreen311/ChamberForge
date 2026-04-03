"use client";

import { useState } from "react";

interface DocumentViewerProps {
  url: string;
  fileName: string;
  fileType?: string;
}

export default function DocumentViewer({
  url,
  fileName,
  fileType = "application/pdf",
}: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPdf = fileType === "application/pdf" || fileName.endsWith(".pdf");
  const isImage = fileType.startsWith("image/");

  return (
    <div className="flex flex-col rounded-xl border border-chamber-700 bg-chamber-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-chamber-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-chamber-200">{fileName}</span>
          <span className="rounded bg-chamber-800 px-2 py-0.5 text-xs text-chamber-400">
            {fileType.split("/").pop()?.toUpperCase()}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-chamber-800 px-3 py-1.5 text-xs text-chamber-300 transition-colors hover:bg-chamber-700 hover:text-white"
        >
          Open in new tab
        </a>
      </div>

      {/* Content area */}
      <div className="relative min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-chamber-900">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-chamber-600 border-t-blue-400" />
          </div>
        )}

        {error && (
          <div className="flex h-[500px] flex-col items-center justify-center gap-3 text-chamber-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">Unable to preview this document.</p>
            <a
              href={url}
              className="text-sm text-blue-400 underline hover:text-blue-300"
            >
              Download instead
            </a>
          </div>
        )}

        {isPdf && !error && (
          <iframe
            src={url}
            className="h-[600px] w-full"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            title={fileName}
          />
        )}

        {isImage && !error && (
          <div className="flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={fileName}
              className="max-h-[600px] rounded-lg object-contain"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          </div>
        )}

        {!isPdf && !isImage && !error && (
          <div className="flex h-[500px] flex-col items-center justify-center gap-3 text-chamber-400">
            <p className="text-sm">Preview not available for this file type.</p>
            <a
              href={url}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
            >
              Download file
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
