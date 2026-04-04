'use client'

import { useState, useEffect } from 'react'

interface WealthEvent {
  id: string
  type: 'exit' | 'inheritance' | 'ipo' | 'board'
  description: string
  timestamp: string
  person: string
}

const dotColors: Record<string, string> = {
  exit: 'bg-[#C9A84C]',
  inheritance: 'bg-purple-400',
  ipo: 'bg-emerald-400',
  board: 'bg-blue-400',
}

const typeLabels: Record<string, string> = {
  exit: 'EXIT',
  inheritance: 'INHERITANCE',
  ipo: 'IPO',
  board: 'BOARD',
}

export default function WealthEventFeed() {
  const [events, setEvents] = useState<WealthEvent[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/wealth-events')
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch (err) {
        console.error('Failed to fetch wealth events:', err)
      }
    }

    fetchEvents()

    const interval = setInterval(fetchEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  function renderDescription(event: WealthEvent) {
    const label = typeLabels[event.type]
    const idx = event.description.toLowerCase().indexOf(event.type)
    if (idx === -1) {
      return (
        <p className="text-sm text-gray-300">
          <span className="font-bold text-white">{label}</span>{' '}
          {event.description}
        </p>
      )
    }
    const before = event.description.slice(0, idx)
    const match = event.description.slice(idx, idx + event.type.length)
    const after = event.description.slice(idx + event.type.length)
    return (
      <p className="text-sm text-gray-300">
        {before}
        <span className="font-bold text-white">{match}</span>
        {after}
      </p>
    )
  }

  return (
    <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
        WEALTH EVENTS
      </h3>
      <div>
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 py-3 border-b border-[#1e2a3a] last:border-0"
          >
            <div
              className={`w-2 h-2 rounded-full mt-1.5 ${dotColors[event.type] || 'bg-gray-400'}`}
            />
            <div className="flex-1">
              {renderDescription(event)}
              <p className="text-[11px] text-gray-500 mt-0.5">
                {event.timestamp}
              </p>
            </div>
            <span className="text-[11px] text-[#C9A84C] hover:underline cursor-pointer whitespace-nowrap">
              Brief →
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
