import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with Prisma queries
// e.g. prisma.offer.findMany({ where: filters, orderBy, skip, take })

const offers = [
  {
    id: 'off-001',
    name: 'Wealth360 Advisory Suite',
    client_name: 'Meridian Capital Group',
    client_id: 'cli-101',
    tier: 'platinum',
    status: 'active',
    monthly: 28000,
    delivery_model: 'dedicated',
    playbook: 'wealth-advisory-v3',
    pain_category: 'portfolio-complexity',
    deal_desk: { contract: 'signed', nda: 'signed', proposal: 'approved', sow: 'signed' },
    kpis_defined: 8,
    kpis_total: 10,
    red_team_status: 'passed',
    health_score: 92,
    health_trend: 'up',
    renewal_date: '2026-09-15',
    renewal_days: 165,
    next_action: 'Quarterly business review prep',
    next_action_type: 'review',
    completion_pct: 85,
    created_at: '2025-06-10T14:30:00Z',
  },
  {
    id: 'off-002',
    name: 'Estate Planning Accelerator',
    client_name: 'Harrington Family Office',
    client_id: 'cli-102',
    tier: 'gold',
    status: 'active',
    monthly: 22000,
    delivery_model: 'hybrid',
    playbook: 'estate-planning-v2',
    pain_category: 'succession-planning',
    deal_desk: { contract: 'signed', nda: 'signed', proposal: 'approved', sow: 'signed' },
    kpis_defined: 6,
    kpis_total: 8,
    red_team_status: 'passed',
    health_score: 87,
    health_trend: 'stable',
    renewal_date: '2026-07-01',
    renewal_days: 89,
    next_action: 'Trust structure finalization',
    next_action_type: 'milestone',
    completion_pct: 72,
    created_at: '2025-08-22T09:15:00Z',
  },
  {
    id: 'off-003',
    name: 'Tax Optimization Engine',
    client_name: 'Bellevue Holdings LLC',
    client_id: 'cli-103',
    tier: 'platinum',
    status: 'active',
    monthly: 25000,
    delivery_model: 'dedicated',
    playbook: 'tax-optimization-v4',
    pain_category: 'tax-efficiency',
    deal_desk: { contract: 'signed', nda: 'signed', proposal: 'approved', sow: 'signed' },
    kpis_defined: 10,
    kpis_total: 10,
    red_team_status: 'passed',
    health_score: 64,
    health_trend: 'down',
    renewal_date: '2026-05-10',
    renewal_days: 37,
    next_action: 'Health score remediation call',
    next_action_type: 'escalation',
    completion_pct: 90,
    created_at: '2025-04-18T11:00:00Z',
  },
  {
    id: 'off-004',
    name: 'Private Markets Access',
    client_name: 'Oakridge Ventures',
    client_id: 'cli-104',
    tier: 'silver',
    status: 'pipeline',
    monthly: 35000,
    delivery_model: 'self-serve',
    playbook: 'private-markets-v1',
    pain_category: 'deal-flow-access',
    deal_desk: { contract: 'pending', nda: 'signed', proposal: 'sent', sow: 'draft' },
    kpis_defined: 4,
    kpis_total: 12,
    red_team_status: 'failed',
    health_score: 42,
    health_trend: 'down',
    renewal_date: null,
    renewal_days: null,
    next_action: 'Red team remediation',
    next_action_type: 'blocker',
    completion_pct: 30,
    created_at: '2026-01-15T16:45:00Z',
  },
  {
    id: 'off-005',
    name: 'Multi-Generational Wealth Transfer',
    client_name: 'The Castillo Trust',
    client_id: 'cli-105',
    tier: 'gold',
    status: 'pipeline',
    monthly: 18000,
    delivery_model: 'hybrid',
    playbook: 'wealth-transfer-v2',
    pain_category: 'intergenerational-planning',
    deal_desk: { contract: 'draft', nda: 'pending', proposal: 'draft', sow: 'not-started' },
    kpis_defined: 2,
    kpis_total: 8,
    red_team_status: 'pending',
    health_score: 55,
    health_trend: 'stable',
    renewal_date: null,
    renewal_days: null,
    next_action: 'Discovery call with family council',
    next_action_type: 'meeting',
    completion_pct: 15,
    created_at: '2026-02-28T10:30:00Z',
  },
  {
    id: 'off-006',
    name: 'Philanthropic Strategy Blueprint',
    client_name: 'Evergreen Foundation',
    client_id: 'cli-106',
    tier: 'gold',
    status: 'draft',
    monthly: 12000,
    delivery_model: 'hybrid',
    playbook: 'philanthropy-v1',
    pain_category: 'impact-measurement',
    deal_desk: { contract: 'not-started', nda: 'not-started', proposal: 'draft', sow: 'not-started' },
    kpis_defined: 0,
    kpis_total: 6,
    red_team_status: 'not-started',
    health_score: null,
    health_trend: null,
    renewal_date: null,
    renewal_days: null,
    next_action: 'Define KPIs with stakeholders',
    next_action_type: 'task',
    completion_pct: 5,
    created_at: '2026-03-20T08:00:00Z',
  },
  {
    id: 'off-007',
    name: 'Risk-Adjusted Portfolio Shield',
    client_name: 'Pinnacle Asset Management',
    client_id: 'cli-107',
    tier: 'platinum',
    status: 'pipeline',
    monthly: 45000,
    delivery_model: 'dedicated',
    playbook: 'risk-management-v3',
    pain_category: 'downside-protection',
    deal_desk: { contract: 'pending', nda: 'signed', proposal: 'approved', sow: 'pending' },
    kpis_defined: 7,
    kpis_total: 10,
    red_team_status: 'in-progress',
    health_score: 73,
    health_trend: 'up',
    renewal_date: null,
    renewal_days: null,
    next_action: 'SOW final review meeting',
    next_action_type: 'meeting',
    completion_pct: 55,
    created_at: '2026-01-05T13:20:00Z',
  },
  {
    id: 'off-008',
    name: 'Digital Asset Custody Framework',
    client_name: 'NextWave Digital Trust',
    client_id: 'cli-108',
    tier: 'silver',
    status: 'draft',
    monthly: 34000,
    delivery_model: 'self-serve',
    playbook: 'digital-assets-v1',
    pain_category: 'crypto-custody',
    deal_desk: { contract: 'not-started', nda: 'draft', proposal: 'not-started', sow: 'not-started' },
    kpis_defined: 1,
    kpis_total: 8,
    red_team_status: 'not-started',
    health_score: null,
    health_trend: null,
    renewal_date: null,
    renewal_days: null,
    next_action: 'Regulatory compliance assessment',
    next_action_type: 'task',
    completion_pct: 3,
    created_at: '2026-03-28T15:10:00Z',
  },
];

export async function GET(request: NextRequest) {
  // TODO: Replace with Prisma query with dynamic where/orderBy/pagination
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const tier = searchParams.get('tier');
  const delivery_model = searchParams.get('delivery_model');
  const q = searchParams.get('q');
  const sort = searchParams.get('sort') || 'created_at';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let filtered = [...offers];

  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }
  if (tier) {
    filtered = filtered.filter((o) => o.tier === tier);
  }
  if (delivery_model) {
    filtered = filtered.filter((o) => o.delivery_model === delivery_model);
  }
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        o.client_name.toLowerCase().includes(query)
    );
  }

  // Basic sort
  filtered.sort((a, b) => {
    const aVal = a[sort as keyof typeof a];
    const bVal = b[sort as keyof typeof b];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal);
    if (typeof aVal === 'number' && typeof bVal === 'number') return bVal - aVal;
    return 0;
  });

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    data: paginated,
    total: filtered.length,
    page,
    limit,
  });
}
