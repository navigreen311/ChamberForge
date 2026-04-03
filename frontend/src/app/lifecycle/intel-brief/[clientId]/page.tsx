"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import ExportButton from "@/components/modules/ExportButton";

interface BriefSection {
  title: string;
  content?: string;
  items?: string[];
}

interface IntelBrief {
  client: string;
  generatedAt: string;
  healthScore: number;
  sections: BriefSection[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function IntelBriefPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<IntelBrief | null>(null);

  const generateBrief = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/v1/lifecycle/intel-brief/${clientId}`);
      setBrief(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Failed to generate intel brief");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on first load
  useState(() => {
    generateBrief();
  });

  if (loading && !brief) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    );
  }

  if (error && !brief) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
        <h1 className="text-3xl font-display font-bold text-white mb-4">Intel Brief</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400 mb-4">{error}</div>
        <button onClick={generateBrief} className="px-4 py-2 bg-gold-400 text-chamber-950 font-semibold rounded-lg hover:bg-gold-300 transition text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!brief) return null;

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/lifecycle" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Lifecycle</a>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Intel Brief: {brief.client}</h1>
          <p className="text-chamber-400">Generated {brief.generatedAt}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className={`text-3xl font-bold ${brief.healthScore >= 80 ? "text-green-400" : brief.healthScore >= 60 ? "text-gold-400" : "text-red-400"}`}>{brief.healthScore}</span>
            <p className="text-xs text-chamber-500">Health Score</p>
          </div>
          <ExportButton
            entityType="intel-brief"
            entityId={clientId}
            userId="current-user"
            data={brief as unknown as Record<string, unknown>}
          />
          <button
            onClick={generateBrief}
            disabled={loading}
            className="px-4 py-2 border border-chamber-600 text-chamber-300 rounded-lg hover:border-chamber-400 transition text-sm disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Brief"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4 text-red-400 mb-6">{error}</div>
      )}

      <div className="space-y-6">
        {brief.sections.map((section, idx) => (
          <div key={idx} className="bg-chamber-900 rounded-xl p-6 border border-chamber-800">
            <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
            {section.content ? (
              <p className="text-chamber-300">{section.content}</p>
            ) : (
              <ul className="space-y-2">
                {section.items?.map((item, i) => (
                  <li key={i} className="text-sm text-chamber-300 pl-3 border-l-2 border-gold-400/30">{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
