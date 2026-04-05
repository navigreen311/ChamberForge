// Skeleton pulse animation base
const pulse = "animate-pulse bg-[#1e2a3a] rounded"

// ---------------------------------------------------------------------------
// 1. KPI Strip — 6 metric cards in a row
// ---------------------------------------------------------------------------
export function KPIStripSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
          <div className={`${pulse} h-3 w-20 mb-2`} />
          <div className="flex items-baseline gap-2">
            <div className={`${pulse} h-7 w-16`} />
            <div className={`${pulse} h-4 w-4`} />
          </div>
          <div className={`${pulse} h-6 w-full mt-3`} />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 2. Command AI / Next Action Card — hero card with priority, title, body,
//    evidence links and action buttons
// ---------------------------------------------------------------------------
export function CommandAICardSkeleton() {
  return (
    <div className="bg-[#111827] border-2 border-[#1e2a3a] rounded-xl p-6">
      {/* Header row: priority badge + confidence */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`${pulse} h-5 w-16 rounded-full`} />
          <div className={`${pulse} h-6 w-3/4 mt-2`} />
        </div>
        <div className={`${pulse} h-7 w-28 rounded-lg`} />
      </div>
      {/* Description */}
      <div className={`${pulse} h-4 w-full mt-4`} />
      <div className={`${pulse} h-4 w-5/6 mt-2`} />
      {/* Why */}
      <div className={`${pulse} h-4 w-4/6 mt-3`} />
      {/* Evidence links */}
      <div className="flex gap-2 mt-3">
        <div className={`${pulse} h-5 w-24 rounded`} />
        <div className={`${pulse} h-5 w-20 rounded`} />
      </div>
      {/* Impact */}
      <div className={`${pulse} h-4 w-40 mt-3`} />
      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <div className={`${pulse} h-9 w-24 rounded-lg`} />
        <div className={`${pulse} h-9 w-20 rounded-lg`} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 3. Client Health Strip — 4 compact client cards with sparkline placeholder
// ---------------------------------------------------------------------------
export function ClientHealthStripSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`${pulse} h-4 w-28`} />
            <div className={`${pulse} h-5 w-14 rounded-full`} />
          </div>
          {/* Key facts */}
          <div className="space-y-1.5 mb-3">
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-5/6`} />
            <div className={`${pulse} h-3 w-4/6`} />
          </div>
          {/* Sparkline placeholder */}
          <div className={`${pulse} h-8 w-full`} />
          <div className={`${pulse} h-3 w-20 mt-2`} />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 4. Opportunity Ranker — table with header + 5 rows
// ---------------------------------------------------------------------------
export function OpportunityRankerSkeleton() {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl overflow-hidden">
      {/* Table title */}
      <div className="px-4 py-3 border-b border-[#1e2a3a]">
        <div className={`${pulse} h-4 w-36`} />
      </div>
      {/* Column headers */}
      <div className="px-4 py-2 border-b border-[#1e2a3a] flex gap-4">
        <div className={`${pulse} h-3 w-6`} />
        <div className={`${pulse} h-3 w-24`} />
        <div className={`${pulse} h-3 w-20`} />
        <div className={`${pulse} h-3 w-10 ml-auto`} />
        <div className={`${pulse} h-3 w-12`} />
        <div className={`${pulse} h-3 w-10`} />
        <div className={`${pulse} h-3 w-16`} />
      </div>
      {/* 5 data rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-[#1e2a3a]/50 flex items-center gap-4">
          <div className={`${pulse} h-4 w-5`} />
          <div className={`${pulse} h-4 w-32`} />
          <div className={`${pulse} h-4 w-28`} />
          <div className={`${pulse} h-4 w-10 ml-auto`} />
          <div className={`${pulse} h-4 w-8`} />
          <div className={`${pulse} h-4 w-8`} />
          <div className={`${pulse} h-6 w-20 rounded`} />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 5. Wealth Event Feed — 5 timeline-style event items
// ---------------------------------------------------------------------------
export function WealthEventFeedSkeleton() {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4 space-y-3">
      <div className={`${pulse} h-4 w-32 mb-2`} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1e2a3a]/50 last:border-0">
          {/* Timeline dot */}
          <div className={`${pulse} h-3 w-3 rounded-full mt-1 shrink-0`} />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className={`${pulse} h-4 w-40`} />
              <div className={`${pulse} h-3 w-16 ml-auto`} />
            </div>
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-3/4`} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 6. Daily Brief — collapsible panel with changes, alerts, actions
// ---------------------------------------------------------------------------
export function DailyBriefSkeleton() {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className={`${pulse} h-4 w-44`} />
        <div className={`${pulse} h-4 w-4`} />
      </div>
      <div className="space-y-4 px-4 pb-4">
        {/* Changes section */}
        <div>
          <div className={`${pulse} h-3 w-40 mb-2`} />
          <div className="space-y-1">
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-5/6`} />
            <div className={`${pulse} h-3 w-4/6`} />
          </div>
        </div>
        {/* Alerts section */}
        <div>
          <div className={`${pulse} h-3 w-16 mb-2`} />
          <div className="space-y-1">
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-3/4`} />
          </div>
        </div>
        {/* Recommended actions */}
        <div>
          <div className={`${pulse} h-3 w-36 mb-2`} />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`${pulse} h-4 w-4 rounded mt-0.5 shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`${pulse} h-4 w-32`} />
                    <div className={`${pulse} h-4 w-14 rounded-full`} />
                  </div>
                  <div className={`${pulse} h-3 w-48 mt-1`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 7. Agent Status Grid — 10 compact agent status buttons in a grid
// ---------------------------------------------------------------------------
export function AgentStatusGridSkeleton() {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4">
      <div className={`${pulse} h-4 w-24 mb-3`} />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 bg-[#1e2a3a]/50 rounded-lg px-3 py-2">
            <div className={`${pulse} h-2.5 w-2.5 rounded-full shrink-0`} />
            <div className="min-w-0 flex-1">
              <div className={`${pulse} h-3 w-16 mb-1`} />
              <div className={`${pulse} h-2 w-10`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 8. Risk Review Queue — 3 risk items needing attention
// ---------------------------------------------------------------------------
export function RiskReviewQueueSkeleton() {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-4 space-y-3">
      <div className={`${pulse} h-4 w-36 mb-1`} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-[#1e2a3a]/30 rounded-lg">
          {/* Severity indicator */}
          <div className={`${pulse} h-8 w-2 rounded-full shrink-0`} />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className={`${pulse} h-4 w-36`} />
              <div className={`${pulse} h-5 w-16 rounded-full ml-auto`} />
            </div>
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-2/3`} />
          </div>
          {/* Action button */}
          <div className={`${pulse} h-8 w-20 rounded-lg shrink-0`} />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 9. Metrics Row — 4 metric cards (matches dashboard page grid)
// ---------------------------------------------------------------------------
export function MetricsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5">
          <div className={`${pulse} h-3 w-20 mb-2`} />
          <div className="flex items-end gap-2">
            <div className={`${pulse} h-7 w-16`} />
            <div className={`${pulse} h-4 w-10`} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 10. Intel Brief Card — compact client brief card
// ---------------------------------------------------------------------------
export function IntelBriefCardSkeleton() {
  return (
    <div className="bg-[#111827] border border-[#1e2a3a] rounded-xl p-5 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <div className={`${pulse} h-4 w-32`} />
        <div className={`${pulse} h-5 w-16 rounded-full`} />
      </div>
      {/* Key facts */}
      <div className="mb-3">
        <div className={`${pulse} h-3 w-16 mb-2`} />
        <div className="space-y-1.5">
          <div className={`${pulse} h-3 w-full`} />
          <div className={`${pulse} h-3 w-5/6`} />
          <div className={`${pulse} h-3 w-4/6`} />
        </div>
      </div>
      {/* Talking points */}
      <div>
        <div className={`${pulse} h-3 w-24 mb-2`} />
        <div className="space-y-1.5">
          <div className={`${pulse} h-3 w-full`} />
          <div className={`${pulse} h-3 w-4/5`} />
        </div>
      </div>
      <div className={`${pulse} h-3 w-28 mt-3`} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// 11. Full Dashboard Skeleton — composes all sections in dashboard layout order
// ---------------------------------------------------------------------------
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#030712] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className={`${pulse} h-8 w-56 mb-2`} />
          <div className={`${pulse} h-4 w-72`} />
        </div>
        <div className={`${pulse} h-9 w-24 rounded-lg`} />
      </div>

      {/* Next Action Card */}
      <CommandAICardSkeleton />

      {/* Metrics Row */}
      <MetricsRowSkeleton />

      {/* Agent Grid + Daily Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`${pulse} h-5 w-32 mb-4`} />
          <AgentStatusGridSkeleton />
        </div>
        <DailyBriefSkeleton />
      </div>

      {/* Opportunities */}
      <OpportunityRankerSkeleton />
    </div>
  )
}
