import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      client: 'Wellington Trust',
      deliverable: 'Incident Response Plan',
      days_late: 2,
      priority: 'critical',
    },
    {
      client: 'Elizabeth Thornton',
      deliverable: 'Monthly Report',
      days_late: 1,
      priority: 'medium',
    },
  ])
}
