"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface Backup {
  s3_key: string;
  filename: string;
  size_bytes: number;
  last_modified: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBackups = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/admin/backups");
      setBackups(res.data.backups || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load backups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleTriggerBackup = async () => {
    setTriggerLoading(true);
    setMessage(null);
    try {
      const res = await api.post("/api/v1/admin/backups/trigger");
      setMessage(`Backup queued (task: ${res.data.task_id})`);
    } catch (err: any) {
      setMessage(`Failed to trigger backup: ${err?.message}`);
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleVerify = async (s3Key: string) => {
    setVerifyingKey(s3Key);
    setMessage(null);
    try {
      const res = await api.post(`/api/v1/admin/backups/verify/${s3Key}`);
      setMessage(`Verification queued (task: ${res.data.task_id})`);
    } catch (err: any) {
      setMessage(`Verification failed: ${err?.message}`);
    } finally {
      setVerifyingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-display font-bold text-white">Database Backups</h1>
        <button
          onClick={handleTriggerBackup}
          disabled={triggerLoading}
          className="px-4 py-2 bg-gold-500 text-chamber-950 rounded-lg font-medium hover:bg-gold-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {triggerLoading ? "Triggering..." : "Trigger Manual Backup"}
        </button>
      </div>
      <p className="text-chamber-400 mb-6">
        Automated daily backups at 2:00 AM UTC. Integrity verified weekly on Sundays at 4:00 AM UTC.
      </p>

      {message && (
        <div className="mb-6 bg-blue-400/10 border border-blue-400/30 rounded-xl p-4 text-blue-400 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-chamber-900 rounded-xl border border-chamber-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-chamber-800">
              <th className="text-left text-chamber-400 text-sm font-medium px-6 py-4">Filename</th>
              <th className="text-left text-chamber-400 text-sm font-medium px-6 py-4">Date</th>
              <th className="text-left text-chamber-400 text-sm font-medium px-6 py-4">Size</th>
              <th className="text-right text-chamber-400 text-sm font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-chamber-500 py-12">
                  No backups found. Trigger a manual backup or wait for the daily schedule.
                </td>
              </tr>
            ) : (
              backups.map((b) => (
                <tr key={b.s3_key} className="border-b border-chamber-800/50 hover:bg-chamber-800/30 transition">
                  <td className="px-6 py-4">
                    <span className="text-white text-sm font-mono">{b.filename}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-chamber-300 text-sm">
                      {new Date(b.last_modified).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-chamber-300 text-sm">{formatBytes(b.size_bytes)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleVerify(b.s3_key)}
                      disabled={verifyingKey === b.s3_key}
                      className="text-gold-400 hover:text-gold-300 text-sm font-medium transition disabled:opacity-50"
                    >
                      {verifyingKey === b.s3_key ? "Verifying..." : "Verify"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-chamber-500 text-xs">
        Retention: last 30 backups kept. Older backups are automatically deleted.
      </div>
    </div>
  );
}
