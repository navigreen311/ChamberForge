import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with Prisma query
// e.g. prisma.offer.findUnique({ where: { id }, include: { valueStack: true, evidenceChain: true } })

const offerDetails: Record<string, object> = {
  'off-001': {
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

    value_stack: [
      { label: 'Portfolio Rebalancing Automation', impact: 'high', status: 'delivered' },
      { label: 'Custom Risk Scoring Model', impact: 'high', status: 'delivered' },
      { label: 'Real-Time Market Alerts', impact: 'medium', status: 'in-progress' },
      { label: 'Client Reporting Dashboard', impact: 'medium', status: 'delivered' },
      { label: 'Tax-Loss Harvesting Engine', impact: 'high', status: 'planned' },
    ],

    pricing_model: {
      type: 'tiered',
      base_fee: 20000,
      performance_fee_pct: 1.5,
      aum_threshold: 50_000_000,
      billing_cycle: 'monthly',
      discount_applied: false,
    },

    guarantee_framework: {
      type: 'performance-based',
      metric: 'portfolio-alpha',
      target: 2.5,
      measurement_period: 'quarterly',
      remedy: 'fee-credit',
      remedy_cap_pct: 25,
    },

    sop_bundle: [
      { id: 'sop-010', name: 'Client Onboarding Checklist', version: '3.1', status: 'active' },
      { id: 'sop-011', name: 'Rebalancing Execution Protocol', version: '2.4', status: 'active' },
      { id: 'sop-012', name: 'Quarterly Review Playbook', version: '1.8', status: 'active' },
      { id: 'sop-013', name: 'Escalation & Exception Handling', version: '2.0', status: 'draft' },
    ],

    guardrails_status: 'active',
    compliance_risk: 'low',
    voiceforge_ready: true,
    visionaudio_ready: true,
    trust_pack_status: 'complete',

    evidence_chain: [
      { date: '2025-06-10', event: 'Offer created', actor: 'Sarah Chen', type: 'lifecycle' },
      { date: '2025-06-18', event: 'NDA executed', actor: 'Legal Bot', type: 'deal-desk' },
      { date: '2025-07-02', event: 'Proposal approved by client', actor: 'James Whitfield', type: 'deal-desk' },
      { date: '2025-07-10', event: 'SOW signed — engagement started', actor: 'Sarah Chen', type: 'deal-desk' },
      { date: '2025-09-15', event: 'Red team review passed (score: 88)', actor: 'Red Team AI', type: 'quality' },
      { date: '2025-12-01', event: 'Health score improved to 92', actor: 'System', type: 'health' },
      { date: '2026-03-20', event: 'QBR scheduled for April', actor: 'Sarah Chen', type: 'lifecycle' },
    ],
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const detail = offerDetails[id];

  if (!detail) {
    return NextResponse.json(
      { error: 'Offer not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}
