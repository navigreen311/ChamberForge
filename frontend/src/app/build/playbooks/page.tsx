"use client";

import { useEffect, useState } from "react";
import PlaybookCard from "@/components/modules/PlaybookCard";

interface Playbook {
  id: string;
  slug: string;
  name: string;
  target_buyer: string;
  price_range_min: number;
  price_range_max: number;
  core_pain: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PlaybooksGalleryPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaybooks() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/playbooks/`);
        if (!res.ok) throw new Error("Failed to fetch playbooks");
        const data = await res.json();
        setPlaybooks(data.playbooks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybooks();
  }, []);

  return (
    <div className="min-h-screen bg-chamber-950 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Playbook <span className="text-gold-400">Gallery</span>
          </h1>
          <p className="mt-4 text-lg text-chamber-300">
            10 premium service verticals. Activate, customize, and launch in
            under 60 minutes.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400">
            {error}
          </div>
        )}

        {/* Grid — 2 columns x 5 rows */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {playbooks.map((playbook) => (
              <PlaybookCard
                key={playbook.slug}
                slug={playbook.slug}
                name={playbook.name}
                targetBuyer={playbook.target_buyer}
                priceRangeMin={playbook.price_range_min}
                priceRangeMax={playbook.price_range_max}
                corePain={playbook.core_pain}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
