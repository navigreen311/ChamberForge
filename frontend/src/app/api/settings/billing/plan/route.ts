import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    plan: 'Enterprise',
    status: 'active',
    billingCycle: 'annual',
    pricePerMonth: 2499,
    nextBillingDate: '2026-05-01T00:00:00Z',
    seatsUsed: 12,
    seatsTotal: 25,
    aiCreditsUsed: 184000,
    aiCreditsTotal: 500000,
    storageUsedGb: 48.2,
    storageTotalGb: 100,
    features: [
      'Unlimited clients',
      'AI-powered discovery engine',
      'Custom playbook builder',
      'White-label client portals',
      'Priority support',
      'Advanced analytics & reporting',
      'API access',
      'SSO / SAML authentication',
    ],
    startDate: '2025-05-01T00:00:00Z',
    contractEndDate: '2026-05-01T00:00:00Z',
  })
}
