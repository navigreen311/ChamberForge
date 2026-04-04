'use client'

import { useState, useEffect } from 'react'

interface Alert {
  severity: 'critical' | 'high'
  message: string
}

interface Action {
  id: string
  text: string
  priority: 'critical' | 'high' | 'medium'
  done: boolean
}

interface BriefData {
  date: string
  changes: string[]
  alerts: Alert[]
  actions: Action[]
}

const priorityStyles: Record<string, string> = {
  critical: 'bg-red-900/50 text-red-400',
  high: 'bg-amber-900/50 text-amber-400',
  medium: 'bg-gray-800 text-gray-400',
}

const alertStyles: Record<string, string> = {
  critical: 'border-red-500 text-red-300',
  high: 'border-amber-500 text-amber-300',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function DailyBrief() {
  const [brief, setBrief] = useState<BriefData | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/daily-brief/today')
      .then((res) => res.json())
      .then((data: BriefData) => {
        setBrief(data)
        const initial: Record<string, boolean> = {}
        data.actions.forEach((a) => {
          initial[a.id] = a.done
        })
        setCheckedItems(initial)
      })
      .catch(console.error)
  }, [])

  const toggleAction = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (!brief) {
    return (
      <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-40 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-700 rounded w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white">Daily Brief</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatDate(brief.date)}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={expanded ? 'Collapse sections' : 'Expand sections'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Changes Section */}
          <div className="mt-4">
            <p className="text-[10px] uppercase text-gray-500 mb-2 tracking-wider font-medium">
              Changes Since Yesterday
            </p>
            <ul className="space-y-1.5">
              {brief.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts Section */}
          <div className="mt-4">
            <p className="text-[10px] uppercase text-gray-500 mb-2 tracking-wider font-medium">
              Alerts
            </p>
            <div className="space-y-0">
              {brief.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`border-l-2 pl-3 py-2 mb-2 text-sm ${alertStyles[alert.severity] || ''}`}
                >
                  <div className="flex items-start gap-1.5">
                    <svg
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="mt-4">
            <p className="text-[10px] uppercase text-gray-500 mb-2 tracking-wider font-medium">
              Recommended Actions
            </p>
            <div className="space-y-2">
              {brief.actions.map((action) => {
                const isChecked = checkedItems[action.id] ?? false
                return (
                  <div key={action.id} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAction(action.id)}
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#C9A84C] border-[#C9A84C]'
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      aria-label={`Toggle ${action.text}`}
                    >
                      {isChecked && (
                        <svg
                          className="w-3 h-3 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`text-sm flex-1 ${
                        isChecked ? 'line-through text-gray-500' : 'text-gray-300'
                      }`}
                    >
                      {action.text}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 rounded font-medium ${priorityStyles[action.priority] || ''}`}
                    >
                      {action.priority}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
