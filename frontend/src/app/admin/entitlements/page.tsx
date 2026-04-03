"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  tier?: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function EntitlementsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const res = await api.get("/api/v1/admin/flags");
        setFlags(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || "Failed to load feature flags");
      } finally {
        setLoading(false);
      }
    }
    fetchFlags();
  }, []);

  const toggleFlag = async (name: string, currentEnabled: boolean) => {
    setToggleLoading(name);
    try {
      await api.put(`/api/v1/admin/flags/${name}`, { enabled: !currentEnabled });
      setFlags((prev) => prev.map((f) => f.name === name ? { ...f, enabled: !currentEnabled } : f));
    } catch (err: any) {
      setError(`Failed to toggle ${name}: ${err?.response?.data?.detail || err?.message}`);
    } finally {
      setToggleLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/admin" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Admin</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Feature Entitlements</h1>
      <p className="text-chamber-400 mb-8">Enable or disable platform features and manage tier access</p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 mb-6">{error}</div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
          <p className="text-chamber-400 text-sm">Enabled</p>
          <p className="text-2xl font-bold text-green-400">{flags.filter(f => f.enabled).length}</p>
        </div>
        <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
          <p className="text-chamber-400 text-sm">Disabled</p>
          <p className="text-2xl font-bold text-chamber-400">{flags.filter(f => !f.enabled).length}</p>
        </div>
        <div className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
          <p className="text-chamber-400 text-sm">Total Features</p>
          <p className="text-2xl font-bold text-white">{flags.length}</p>
        </div>
      </div>

      {/* Feature Flags */}
      {flags.length === 0 ? (
        <div className="bg-chamber-900 rounded-xl p-8 border border-chamber-800 text-center text-chamber-500">No feature flags found.</div>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <div key={f.name} className={`bg-chamber-900 rounded-xl p-5 border ${f.enabled ? "border-chamber-800" : "border-chamber-800 opacity-60"} flex items-center justify-between`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold">{f.name}</h3>
                  {f.tier && (
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      f.tier === "Starter" ? "bg-chamber-700 text-chamber-300" :
                      f.tier === "Pro" ? "bg-blue-400/20 text-blue-400" :
                      "bg-gold-400/20 text-gold-400"
                    }`}>{f.tier}</span>
                  )}
                </div>
                <p className="text-sm text-chamber-400">{f.description}</p>
              </div>
              <button
                onClick={() => toggleFlag(f.name, f.enabled)}
                disabled={toggleLoading === f.name}
                className={`relative w-12 h-6 rounded-full transition ${f.enabled ? "bg-gold-400" : "bg-chamber-700"} ${toggleLoading === f.name ? "opacity-50" : ""}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
