import { NextRequest, NextResponse } from 'next/server'

const clients = [
  {
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
  },
  {
    id: 'c-002',
    name: 'Hiroshi Nakamura',
    company: 'Nakamura Holdings',
    tier: 'gold',
    status: 'active',
    pain_categories: ['cross-border', 'succession'],
    last_contact_at: '2026-03-28T10:00:00Z',
    last_contact_type: 'in-person',
    last_contact_days: 6,
    wealth_event: null,
    health_score: 78,
    health_trend: 'stable',
    kpis_defined: 5,
    kpis_total: 5,
    monthly_retainer: 18000,
    renewal_date: '2026-09-01',
    renewal_days: 151,
    trust_channel: 'family-referral',
    touchpoints_count: 24,
    offers_count: 3,
    created_at: '2024-06-15T00:00:00Z',
  },
  {
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
  },
  {
    id: 'c-004',
    name: 'Margaret Thornton',
    company: 'Thornton Estates',
    tier: 'silver',
    status: 'alumni',
    pain_categories: ['wealth-transfer', 'family-governance'],
    last_contact_at: '2026-02-10T16:00:00Z',
    last_contact_type: 'phone',
    last_contact_days: 52,
    wealth_event: { type: 'inheritance', description: 'Received $8M inheritance from family trust' },
    health_score: 45,
    health_trend: 'declining',
    kpis_defined: 2,
    kpis_total: 5,
    monthly_retainer: 0,
    renewal_date: null,
    renewal_days: null,
    trust_channel: 'event-network',
    touchpoints_count: 9,
    offers_count: 1,
    created_at: '2024-03-10T00:00:00Z',
  },
  {
    id: 'c-005',
    name: 'David Chen',
    company: 'Chen Ventures',
    tier: 'gold',
    status: 'prospect',
    pain_categories: ['venture-portfolio', 'tax-optimization'],
    last_contact_at: '2026-03-25T11:00:00Z',
    last_contact_type: 'linkedin',
    last_contact_days: 9,
    wealth_event: { type: 'ipo', description: 'Portfolio company IPO valued at $200M' },
    health_score: 70,
    health_trend: 'stable',
    kpis_defined: 0,
    kpis_total: 0,
    monthly_retainer: 0,
    renewal_date: null,
    renewal_days: null,
    trust_channel: 'content-marketing',
    touchpoints_count: 5,
    offers_count: 1,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'c-006',
    name: 'Sophia Andersen',
    company: 'Andersen Family Trust',
    tier: 'platinum',
    status: 'prospect',
    pain_categories: ['estate-planning', 'philanthropy'],
    last_contact_at: '2026-03-20T15:45:00Z',
    last_contact_type: 'referral-intro',
    last_contact_days: 14,
    wealth_event: null,
    health_score: 65,
    health_trend: 'stable',
    kpis_defined: 0,
    kpis_total: 0,
    monthly_retainer: 0,
    renewal_date: null,
    renewal_days: null,
    trust_channel: 'family-referral',
    touchpoints_count: 3,
    offers_count: 0,
    created_at: '2026-02-28T00:00:00Z',
  },
  {
    id: 'c-007',
    name: 'Robert Kingsley',
    company: 'Kingsley Capital',
    tier: 'gold',
    status: 'active',
    pain_categories: ['alternative-investments', 'risk-management'],
    last_contact_at: '2026-04-01T08:30:00Z',
    last_contact_type: 'video-call',
    last_contact_days: 2,
    wealth_event: null,
    health_score: 88,
    health_trend: 'improving',
    kpis_defined: 5,
    kpis_total: 6,
    monthly_retainer: 20000,
    renewal_date: '2026-05-01',
    renewal_days: 28,
    trust_channel: 'advisor-direct',
    touchpoints_count: 22,
    offers_count: 3,
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'c-008',
    name: 'Aisha Patel',
    company: 'Patel Medical Group',
    tier: 'silver',
    status: 'active',
    pain_categories: ['business-succession', 'retirement-planning'],
    last_contact_at: '2026-03-18T13:00:00Z',
    last_contact_type: 'phone',
    last_contact_days: 16,
    wealth_event: { type: 'business-sale', description: 'Exploring sale of medical practice ($5M valuation)' },
    health_score: 74,
    health_trend: 'stable',
    kpis_defined: 3,
    kpis_total: 5,
    monthly_retainer: 8000,
    renewal_date: '2026-07-20',
    renewal_days: 108,
    trust_channel: 'event-network',
    touchpoints_count: 14,
    offers_count: 2,
    created_at: '2025-04-22T00:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status')
  const tier = searchParams.get('tier')
  const painCategory = searchParams.get('pain_category')
  const trustChannel = searchParams.get('trust_channel')
  const q = searchParams.get('q')
  const sort = searchParams.get('sort') || 'name'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  let filtered = [...clients]

  if (status) {
    filtered = filtered.filter((c) => c.status === status)
  }
  if (tier) {
    filtered = filtered.filter((c) => c.tier === tier)
  }
  if (painCategory) {
    filtered = filtered.filter((c) => c.pain_categories.includes(painCategory))
  }
  if (trustChannel) {
    filtered = filtered.filter((c) => c.trust_channel === trustChannel)
  }
  if (q) {
    const lower = q.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.company.toLowerCase().includes(lower)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sort) {
      case 'health_score':
        return b.health_score - a.health_score
      case '-health_score':
        return a.health_score - b.health_score
      case 'monthly_retainer':
        return b.monthly_retainer - a.monthly_retainer
      case 'last_contact_days':
        return a.last_contact_days - b.last_contact_days
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const total = filtered.length
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    data: paginated,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  })
}
