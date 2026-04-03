"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Alumni {
  client_id: string;
  name: string;
  health_score_at_exit: number;
  graduated_at: string;
  referral_count: number;
}

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/api/v1/lifecycle/alumni")
      .then((res) => setAlumni(res.data))
      .catch((err) => setError(err?.response?.data?.detail || err?.message || "Failed to load alumni"))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gold-400 mb-2">Alumni Network</h1>
      <p className="text-chamber-400 mb-8">Post-engagement relationships and referral candidates</p>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400 mb-6">{error}</div>
      )}

      {loading ? (
        <p className="text-chamber-400 animate-pulse">Loading alumni...</p>
      ) : alumni.length === 0 ? (
        <p className="text-chamber-500">No alumni records found.</p>
      ) : (
        <div className="space-y-4">
          {alumni.map((a) => (
            <div
              key={a.client_id}
              className="bg-chamber-900 border border-chamber-700 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h3 className="text-white font-semibold text-lg">{a.name}</h3>
                <p className="text-chamber-400 text-sm">
                  Graduated {new Date(a.graduated_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-chamber-500 text-xs uppercase">Exit Score</p>
                  <p className={`font-bold text-lg ${scoreColor(a.health_score_at_exit)}`}>
                    {a.health_score_at_exit}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-chamber-500 text-xs uppercase">Referrals</p>
                  <p className="text-white font-bold text-lg">{a.referral_count}</p>
                </div>

                {/* Timeline dots */}
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < a.referral_count ? "bg-gold-500" : "bg-chamber-700"
                      }`}
                      title={i < a.referral_count ? "Touchpoint completed" : "Upcoming"}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
