'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Agent {
  name: string
  key: string
  status: 'active' | 'busy' | 'idle' | 'error'
  last_run: string
  activity_count: number
  error?: string
}

const statusDotClass: Record<Agent['status'], string> = {
  active: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]',
  busy: 'bg-amber-400 animate-pulse',
  idle: 'bg-gray-500',
  error: 'bg-red-500',
}

export default function AgentStatusGrid() {
  const [agents, setAgents] = useState<Agent[]>([])

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents/status')
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
      }
    } catch {
      // silently retry on next interval
    }
  }

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
          AI Agents
        </span>
        <Link
          href="/admin/runtime"
          className="text-[11px] text-[#C9A84C] hover:underline"
        >
          Manage &rarr;
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2">
        {agents.map((agent) => (
          <div
            key={agent.key}
            className="bg-[#0D1117] rounded-lg p-3 flex items-center gap-3"
          >
            {/* Status dot */}
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusDotClass[agent.status]}`}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {agent.name}
              </p>
              <p className="text-[10px] text-gray-500">{agent.last_run}</p>
              <p className="text-[10px] text-gray-600">
                {agent.activity_count} actions
              </p>

              {/* Error state */}
              {agent.status === 'error' && agent.error && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-red-400 truncate">
                    {agent.error}
                  </span>
                  <button
                    onClick={fetchAgents}
                    className="text-[10px] text-[#C9A84C] cursor-pointer shrink-0 hover:underline"
                  >
                    retry
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
