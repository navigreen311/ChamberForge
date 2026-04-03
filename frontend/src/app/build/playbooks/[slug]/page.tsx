"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Phase {
  name: string;
  desc: string;
  duration: string;
  tools: string[];
}

interface PlaybookDetail {
  slug: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  uses: number;
  status: string;
  estimatedTime?: string;
  estimated_time?: string;
  difficulty?: string;
  phases: Phase[];
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function PlaybookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<PlaybookDetail | null>(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    async function fetchPlaybook() {
      try {
        const res = await api.get(`/api/v1/playbooks/${slug}`);
        setPlaybook(res.data?.playbook ?? res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to load playbook");
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybook();
  }, [slug]);

  async function handleActivate() {
    setActivating(true);
    setError(null);
    try {
      await api.post(`/api/v1/playbooks/${slug}/activate`);
      setActivated(true);
      setTimeout(() => router.push(`/build/playbooks/${slug}/activate`), 500);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Activation failed");
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-full max-w-2xl mb-8" />
        <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      </div>
    );
  }

  if (error && !playbook) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/build/playbooks" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Playbooks</a>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  if (!playbook) return null;

  const estTime = playbook.estimatedTime ?? playbook.estimated_time ?? "N/A";

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build/playbooks" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Playbooks</a>

      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 mb-6 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-white">{playbook.name}</h1>
            <span className="px-2 py-0.5 bg-chamber-800 text-chamber-400 text-xs rounded-full">{playbook.category}</span>
          </div>
          <p className="text-chamber-400 max-w-2xl">{playbook.description}</p>
        </div>
        <button
          onClick={handleActivate}
          disabled={activated || activating}
          className={`px-5 py-2.5 font-semibold rounded-lg transition ${activated ? "bg-green-400/20 text-green-400 cursor-default" : "bg-gold-400 text-chamber-950 hover:bg-gold-300"} disabled:opacity-50`}
        >{activating ? "Activating..." : activated ? "Activated" : "Activate Playbook"}</button>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ["Steps", playbook.steps],
          ["Est. Duration", estTime],
          ["Difficulty", playbook.difficulty ?? "N/A"],
          ["Times Used", playbook.uses],
        ].map(([l, v]) => (
          <div key={String(l)} className="bg-chamber-900 rounded-xl p-4 border border-chamber-800">
            <p className="text-chamber-400 text-sm">{String(l)}</p>
            <p className="text-lg font-bold text-white">{String(v)}</p>
          </div>
        ))}
      </div>

      {/* Phases */}
      {playbook.phases && playbook.phases.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-white mb-4">Playbook Phases</h3>
          <div className="space-y-3">
            {playbook.phases.map((phase, idx) => (
              <div key={idx} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-sm font-bold flex-shrink-0">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-semibold">{phase.name}</h4>
                      <span className="text-xs text-chamber-500">{phase.duration}</span>
                    </div>
                    <p className="text-sm text-chamber-400 mb-2">{phase.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {(phase.tools ?? []).map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-chamber-800 text-chamber-400 text-xs rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
