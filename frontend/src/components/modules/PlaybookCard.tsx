"use client";

import Link from "next/link";

interface PlaybookCardProps {
  slug: string;
  name: string;
  targetBuyer: string;
  priceRangeMin: number;
  priceRangeMax: number;
  corePain: string;
}

function formatPrice(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export default function PlaybookCard({
  slug,
  name,
  targetBuyer,
  priceRangeMin,
  priceRangeMax,
  corePain,
}: PlaybookCardProps) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-chamber-700 bg-chamber-900 p-6 transition-all hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-400/5">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-gold-300 transition-colors">
          {name}
        </h3>
        <span className="mt-2 inline-block rounded-full bg-chamber-800 px-3 py-1 text-xs font-medium text-chamber-300">
          {targetBuyer}
        </span>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <span className="text-sm text-chamber-400">Price Range</span>
        <p className="text-lg font-bold text-gold-400">
          {formatPrice(priceRangeMin)} &ndash; {formatPrice(priceRangeMax)}
          <span className="text-sm font-normal text-chamber-400">/mo</span>
        </p>
      </div>

      {/* Core Pain */}
      <p className="mb-6 flex-1 text-sm leading-relaxed text-chamber-300">
        {corePain}
      </p>

      {/* CTA */}
      <Link
        href={`/build/playbooks/${slug}`}
        className="mt-auto inline-flex items-center justify-center rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-chamber-950 transition-colors hover:bg-gold-400"
      >
        Activate Playbook
      </Link>
    </div>
  );
}
