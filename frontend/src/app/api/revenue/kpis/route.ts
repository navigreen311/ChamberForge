import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    mrr: { value: 284500, trend: 1.8, direction: 'up' as const },
    arr: { value: 3414000, trend: 1.8, direction: 'up' as const },
    avgRevenuePerClient: { value: 2240, trend: 3.1, direction: 'up' as const },
    netRetentionRate: { value: 112, trend: 2.0, direction: 'up' as const },
    churnRate: { value: 1.2, trend: -0.3, direction: 'down' as const },
    ltv: { value: 168000, trend: 5.2, direction: 'up' as const },
    cac: { value: 8400, trend: -1.5, direction: 'down' as const },
    ltvCacRatio: { value: 20, trend: 6.8, direction: 'up' as const },
    revenueByTier: {
      platinum: { clients: 18, revenue: 126000, pct: 44.3 },
      gold: { clients: 34, revenue: 95200, pct: 33.5 },
      silver: { clients: 52, revenue: 46800, pct: 16.4 },
      bronze: { clients: 23, revenue: 16500, pct: 5.8 },
    },
  })
}
