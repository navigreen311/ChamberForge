'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface RiskItem {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high'
  module: string
  created_at: string
}

export default function RiskReviewQueue() {
  const [items, setItems] = useState<RiskItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/risk-queue')
      .then((res) => res.json())
      .then((data) => {
        setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-1/3" />
          <div className="h-12 bg-gray-700 rounded" />
          <div className="h-12 bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-3">
        <h3 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
          Risk Review Queue
        </h3>
        {items.length > 0 && (
          <span className="bg-red-900/50 text-red-400 text-[10px] px-1.5 rounded-full ml-2">
            {items.length}
          </span>
        )}
      </div>

      <div className="bg-[#111827] rounded-lg border border-[#1e2a3a]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              No items pending review
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`p-4 border-b border-[#1e2a3a] last:border-0 border-l-4 ${
                item.severity === 'critical'
                  ? 'border-l-red-500'
                  : 'border-l-amber-500'
              }`}
            >
              <h4 className="text-sm font-medium text-white">{item.title}</h4>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-500">
                  {item.module} &middot; {item.created_at}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-1.5 rounded ${
                      item.severity === 'critical'
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-amber-900/50 text-amber-400'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <Link
                    href={`/risk-queue/${item.id}`}
                    className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer"
                  >
                    Review now &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
