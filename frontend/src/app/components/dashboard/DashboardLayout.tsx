'use client'
import { ReactNode } from 'react'

interface Props {
  topBar: ReactNode
  kpiStrip: ReactNode
  leftColumn: ReactNode
  rightColumn: ReactNode
}

export default function DashboardLayout({ topBar, kpiStrip, leftColumn, rightColumn }: Props) {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      {topBar}
      <div className="px-4 sm:px-6 py-4">
        {/* KPI strip: 6 cols on desktop, 3 on tablet, 2 on mobile */}
        <div className="[&>div]:grid-cols-2 sm:[&>div]:grid-cols-3 lg:[&>div]:grid-cols-6">
          {kpiStrip}
        </div>

        {/* Two-column layout on desktop, stacked on mobile */}
        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6 min-w-0">
            {leftColumn}
          </div>
          <div className="w-full lg:w-[320px] lg:flex-shrink-0 space-y-4">
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  )
}
