import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'sc-001', name: 'Sarah Chen', score: 87, status: 'Stable — all KPIs on track', category: 'healthy' },
    { id: 'wt-001', name: 'Wellington Trust', score: 62, status: 'At risk — missed last review', category: 'warning' },
    { id: 'hd-001', name: 'Harrington Dynasty', score: 94, status: 'Thriving — upsell opportunity', category: 'healthy' },
    { id: 'nw-001', name: 'New Prospect', score: 0, status: 'Onboarding — day 12 of 90', category: 'new' },
  ])
}
