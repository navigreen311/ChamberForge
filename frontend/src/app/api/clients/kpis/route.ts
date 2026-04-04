import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    active_count: 3,
    active_delta: 1,
    prospect_count: 2,
    mrr: 75000,
    mrr_delta: 12,
    avg_health: 81,
    at_risk_count: 1,
    wealth_events_count: 3,
    renewals_due: 1,
  })
}
