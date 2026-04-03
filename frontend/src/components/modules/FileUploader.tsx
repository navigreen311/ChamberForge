"use client";

import { useCallback, useRef, useState } from "react";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/csv",
  "application/json",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

interface FileUploaderProps {
  workspaceId: string;
  onUploadComplete?: (result: Record<string, unknown>) => void;
  apiBase?: string;
}

export default function FileUploader({
  workspaceId,
  onUploadComplete,
  apiBase = "http://localhost:8000",
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type || "unknown"}" is not allowed.`;
    }
    if (file.size > MAX_SIZE) {
      return "File exceeds 50 MB limit.";
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuccess(null);

      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("workspace_id", workspaceId);

      try {
        const xhr = new XMLHttpRequest();

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const result = JSON.parse(xhr.responseText);
              setSuccess(`Uploaded ${file.name} successfully.`);
              onUploadComplete?.(result);
              resolve();
            } else {
              reject(new Error(xhr.responseText || "Upload failed"));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.open("POST", `${apiBase}/api/v1/storage/upload`);
          xhr.send(formData);
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [workspaceId, apiBase, onUploadComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile],
  );

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-950/30"
            : "border-chamber-700 bg-chamber-900/50 hover:border-chamber-500"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_TYPES.join(",")}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />

        <div className="mb-3 text-4xl text-chamber-400">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <p className="text-sm text-chamber-300">
          Drag & drop a file here, or <span className="text-blue-400 underline">browse</span>
        </p>
        <p className="mt-1 text-xs text-chamber-500">
          PDF, images, CSV, XLSX, DOCX, JSON, TXT — up to 50 MB
        </p>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-chamber-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-chamber-400">{progress}% uploaded</p>
        </div>
      )}

      {/* Status messages */}
      {error && (
        <p className="mt-3 rounded-lg bg-red-950/50 p-3 text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="mt-3 rounded-lg bg-green-950/50 p-3 text-sm text-green-400">{success}</p>
      )}
    </div>
  );
}
