'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function CommandAIButton() {
  const [hasNew, setHasNew] = useState(true)

  // Simulate new recommendations availability; replace with real data hook
  useEffect(() => {
    const interval = setInterval(() => setHasNew(prev => !prev), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link
      href="/command"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-lg shadow-[#C9A84C]/25 hover:bg-[#C9A84C]/90 transition-all hover:scale-105 ${
        hasNew ? 'animate-pulse' : ''
      }`}
      aria-label="Open Command AI"
      title="Command AI"
    >
      <Sparkles className="w-6 h-6 text-[#0D1117]" />
      {hasNew && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0D1117]" />
      )}
    </Link>
  )
}
