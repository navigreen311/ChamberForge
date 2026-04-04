import { NextResponse } from 'next/server'

const clientDetails: Record<string, object> = {
  'c-001': {
    id: 'c-001',
    name: 'Jonathan Wellington III',
    company: 'Wellington Family Office',
    tier: 'platinum',
    status: 'active',
    pain_categories: ['estate-planning', 'tax-optimization'],
    last_contact_at: '2026-03-22T14:30:00Z',
    last_contact_type: 'video-call',
    last_contact_days: 12,
    wealth_event: null,
    health_score: 62,
    health_trend: 'declining',
    kpis_defined: 4,
    kpis_total: 6,
    monthly_retainer: 25000,
    renewal_date: '2026-06-15',
    renewal_days: 73,
    trust_channel: 'advisor-direct',
    touchpoints_count: 18,
    offers_count: 2,
    created_at: '2024-09-01T00:00:00Z',
    household_summary: {
      people_count: 5,
      vendor_count: 3,
      property_count: 4,
    },
    recent_touchpoints: [
      { type: 'video-call', description: 'Quarterly portfolio review — discussed tax-loss harvesting strategy', created_at: '2026-03-22T14:30:00Z' },
      { type: 'email', description: 'Sent updated estate planning proposal with trust restructuring options', created_at: '2026-03-15T10:00:00Z' },
      { type: 'in-person', description: 'Dinner meeting with Jonathan and spouse; discussed succession timeline', created_at: '2026-03-01T19:00:00Z' },
    ],
    active_offers: [
      { name: 'Platinum Estate Planning Suite', monthly: 15000 },
      { name: 'Tax Optimization Advisory', monthly: 10000 },
    ],
    pain_signals: [
      'Mentioned concern about estate tax changes in recent call',
      'Spouse expressed frustration with lack of consolidated reporting',
      'Delayed response to last two follow-up emails',
    ],
    recommended_actions: [
      'Schedule in-person meeting to address declining engagement',
      'Prepare consolidated household report to address spouse concern',
      'Present updated estate tax impact analysis for 2026 legislative changes',
      'Review and refresh KPI targets before Q2 review',
    ],
  },
  'c-003': {
    id: 'c-003',
    name: 'Elena Rivera',
    company: 'Rivera Foundation',
    tier: 'platinum',
    status: 'active',
    pain_categories: ['philanthropy', 'impact-investing'],
    last_contact_at: '2026-03-30T09:15:00Z',
    last_contact_type: 'email',
    last_contact_days: 4,
    wealth_event: { type: 'liquidity-event', description: 'Foundation received $12M endowment' },
    health_score: 91,
    health_trend: 'improving',
    kpis_defined: 6,
    kpis_total: 6,
    monthly_retainer: 32000,
    renewal_date: '2026-12-01',
    renewal_days: 243,
    trust_channel: 'advisor-direct',
    touchpoints_count: 31,
    offers_count: 4,
    created_at: '2023-11-20T00:00:00Z',
    household_summary: {
      people_count: 3,
      vendor_count: 5,
      property_count: 2,
    },
    recent_touchpoints: [
      { type: 'email', description: 'Shared impact investing opportunities matching foundation mission', created_at: '2026-03-30T09:15:00Z' },
      { type: 'video-call', description: 'Foundation board presentation — endowment deployment strategy', created_at: '2026-03-25T14:00:00Z' },
      { type: 'in-person', description: 'Attended foundation gala; introduced to two board members', created_at: '2026-03-10T18:30:00Z' },
    ],
    active_offers: [
      { name: 'Foundation Management Suite', monthly: 12000 },
      { name: 'Impact Investing Advisory', monthly: 8000 },
      { name: 'Philanthropic Strategy', monthly: 7000 },
      { name: 'ESG Portfolio Analysis', monthly: 5000 },
    ],
    pain_signals: [
      'Board requesting more granular impact measurement metrics',
      'Need to deploy $12M endowment within 6-month window',
    ],
    recommended_actions: [
      'Prepare impact measurement dashboard for board review',
      'Present phased endowment deployment timeline with ESG-aligned options',
      'Schedule quarterly foundation strategy session',
    ],
  },
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const detail = clientDetails[params.id]

  if (!detail) {
    return NextResponse.json(
      { error: 'Client not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(detail)
}
