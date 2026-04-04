import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    active_clients: { value: 127, trend: 3.2, direction: 'up' as const },
    monthly_retainer: { value: 284500, trend: 1.8, direction: 'up' as const },
    pipeline_value: { value: 12400000, trend: -2.1, direction: 'down' as const },
    avg_health_score: { value: 82, trend: 0.5, direction: 'up' as const },
    wealth_events: { value: 14, trend: 16.7, direction: 'up' as const },
    risk_queue: { value: 3, trend: -25.0, direction: 'down' as const },
  })
}
