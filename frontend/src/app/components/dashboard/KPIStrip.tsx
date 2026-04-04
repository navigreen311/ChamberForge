'use client'

import { useEffect, useState } from 'react'

interface KPIData {
  value: number
  trend: string
  direction: 'up' | 'down'
}

interface KPIResponse {
  active_clients: KPIData
  monthly_retainer: KPIData
  pipeline_value: KPIData
  avg_health_score: KPIData
  wealth_events: KPIData
  risk_queue: KPIData
}

const KPI_LABELS: { key: keyof KPIResponse; label: string }[] = [
  { key: 'active_clients', label: 'Active Clients' },
  { key: 'monthly_retainer', label: 'Monthly Retainer' },
  { key: 'pipeline_value', label: 'Pipeline Value' },
  { key: 'avg_health_score', label: 'Avg Health Score' },
  { key: 'wealth_events', label: 'Wealth Events' },
  { key: 'risk_queue', label: 'Risk Queue' },
]

function formatValue(key: string, value: number): string {
  if (key === 'monthly_retainer') {
    return `$${Math.round(value / 1000)}K`
  }
  if (key === 'pipeline_value') {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (key === 'avg_health_score') {
    return value.toFixed(1)
  }
  return value.toString()
}

export default function KPIStrip() {
  const [data, setData] = useState<KPIResponse | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/kpis')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="grid grid-cols-6 gap-4 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4 animate-pulse"
          >
            <div className="h-3 w-20 bg-gray-700 rounded mb-2" />
            <div className="h-6 w-16 bg-gray-700 rounded mb-1" />
            <div className="h-3 w-12 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-6 gap-4 w-full">
      {KPI_LABELS.map(({ key, label }) => {
        const kpi = data[key]
        const isUp = kpi.direction === 'up'

        return (
          <div
            key={key}
            className="bg-[#111827] border border-[#1e2a3a] rounded-lg p-4"
          >
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
              {label}
            </p>
            <p className="text-xl font-semibold text-white mt-1">
              {formatValue(key, kpi.value)}
            </p>
            <p
              className={`text-[11px] mt-1 ${
                isUp ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isUp ? '▲' : '▼'} {kpi.trend}
            </p>
          </div>
        )
      })}
    </div>
  )
}
