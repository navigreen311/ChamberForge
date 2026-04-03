"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Playbook {
  slug: string;
  name: string;
  desc?: string;
  description?: string;
  category: string;
  uses: number;
  steps: number;
  status: string;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-chamber-800 rounded ${className}`} />;
}

export default function PlaybooksPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

  useEffect(() => {
    async function fetchPlaybooks() {
      try {
        const res = await api.get("/api/v1/playbooks");
        setPlaybooks(res.data?.playbooks ?? res.data ?? []);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? "Failed to load playbooks");
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybooks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chamber-950 p-8">
        <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
        <h1 className="text-3xl font-display font-bold text-white mb-4">Playbook Gallery</h1>
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-6 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chamber-950 p-8">
      <a href="/build" className="text-gold-400 text-sm hover:underline mb-4 inline-block">&larr; Back to Build</a>
      <h1 className="text-3xl font-display font-bold text-white mb-1">Playbook Gallery</h1>
      <p className="text-chamber-400 mb-8">Proven frameworks for every stage of premium service delivery</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playbooks.map((p) => (
          <a key={p.slug} href={`/build/playbooks/${p.slug}`} className="bg-chamber-900 rounded-xl p-5 border border-chamber-800 hover:border-gold-400/50 transition group">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-chamber-800 text-chamber-400 text-xs rounded-full">{p.category}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "Active" ? "bg-green-400/20 text-green-400" : "bg-chamber-700 text-chamber-400"}`}>{p.status}</span>
            </div>
            <h3 className="text-white font-semibold mb-1 group-hover:text-gold-400 transition">{p.name}</h3>
            <p className="text-sm text-chamber-400 mb-4">{p.desc ?? p.description ?? ""}</p>
            <div className="flex items-center justify-between text-xs text-chamber-500">
              <span>{p.steps} steps</span>
              <span>{p.uses} times used</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
