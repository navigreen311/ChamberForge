import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    total_deliverables: 14,
    sla_adherence: 88,
    slas_at_risk: 2,
    overdue: 2,
    qa_pass_rate: 82,
    qa_delta: 5,
    active_onboardings: 1,
    onboarding_client: 'Marcus Reid',
    escalations_open: 1,
  })
}
