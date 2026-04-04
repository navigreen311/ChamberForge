'use client'

import { useEffect, useState } from 'react'

interface ClientHealth {
  id: string
  name: string
  score: number
  status: string
  category: string
}

function getColorClass(client: ClientHealth): string {
  if (client.category === 'new') return 'border-blue-500'
  if (client.score > 70) return 'border-emerald-500'
  if (client.score >= 50) return 'border-amber-500'
  return 'border-red-500'
}

function getScoreColorClass(client: ClientHealth): string {
  if (client.category === 'new') return 'text-blue-500'
  if (client.score > 70) return 'text-emerald-500'
  if (client.score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function SkeletonCard() {
  return (
    <div className="bg-[#111827] rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-2/3 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-full" />
    </div>
  )
}

export default function ClientHealthStrip() {
  const [clients, setClients] = useState<ClientHealth[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clients/health-summary')
      .then((res) => res.json())
      .then((data) => {
        setClients(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
        CLIENT HEALTH
      </h3>
      {loading ? (
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className={`relative bg-[#111827] rounded-lg p-4 cursor-pointer hover:bg-[#111827]/80 transition border-l-4 ${getColorClass(client)}`}
              onClick={() => {
                window.location.href = `/clients/${client.id}/health`
              }}
            >
              <p className="text-sm font-medium text-white">{client.name}</p>
              <p className="text-xs text-gray-400 mt-1">{client.status}</p>
              <span
                className={`absolute top-3 right-3 text-lg font-bold ${getScoreColorClass(client)}`}
              >
                {client.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
