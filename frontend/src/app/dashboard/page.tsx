'use client'

import TopBar from '@/app/components/dashboard/TopBar'
import KPIStrip from '@/app/components/dashboard/KPIStrip'
import CommandAICard from '@/app/components/dashboard/CommandAICard'
import ClientHealthStrip from '@/app/components/dashboard/ClientHealthStrip'
import OpportunityRanker from '@/app/components/dashboard/OpportunityRanker'
import WealthEventFeed from '@/app/components/dashboard/WealthEventFeed'
import DailyBrief from '@/app/components/dashboard/DailyBrief'
import AgentStatusGrid from '@/app/components/dashboard/AgentStatusGrid'
import RiskReviewQueue from '@/app/components/dashboard/RiskReviewQueue'
import IntegrationStatus from '@/app/components/dashboard/IntegrationStatus'
import QuickActions from '@/app/components/dashboard/QuickActions'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <TopBar />

      <div className="px-6 py-4">
        <KPIStrip />

        <div className="mt-6 flex gap-6">
          {/* Left column — flex-1 */}
          <div className="flex-1 space-y-6">
            <CommandAICard />
            <ClientHealthStrip />
            <OpportunityRanker />
            <WealthEventFeed />
          </div>

          {/* Right column — 320px fixed */}
          <div className="w-[320px] flex-shrink-0 space-y-4">
            <DailyBrief />
            <AgentStatusGrid />
            <RiskReviewQueue />
            <IntegrationStatus />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  )
}
