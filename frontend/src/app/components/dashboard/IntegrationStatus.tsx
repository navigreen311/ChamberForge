'use client'

import { useEffect, useState } from 'react'

interface IntegrationInfo {
  connected: boolean
  modules_active: number
  name: string
}

interface IntegrationData {
  voiceforge: IntegrationInfo
  visionaudioforge: IntegrationInfo
}

export default function IntegrationStatus() {
  const [data, setData] = useState<IntegrationData | null>(null)

  useEffect(() => {
    fetch('/api/integrations/status')
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) return null

  const integrations = [
    { key: 'voiceforge' as const, nameColor: 'text-purple-400' },
    { key: 'visionaudioforge' as const, nameColor: 'text-teal-400' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {integrations.map(({ key, nameColor }) => {
        const info = data[key]
        return (
          <div
            key={key}
            className="bg-[#111827] rounded-lg border border-[#1e2a3a] p-4 cursor-pointer hover:border-[#1e2a3a]/80 transition"
            onClick={() => (window.location.href = '/settings/integrations')}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  info.connected ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              <span className={`text-sm font-medium ${nameColor}`}>
                {info.name}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {info.modules_active} modules active
            </div>
          </div>
        )
      })}
    </div>
  )
}
