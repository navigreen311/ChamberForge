import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with Prisma queries
// e.g. prisma.playbook.findUnique({ where: { id }, include: { items, citations, ... } })

const detailData: Record<string, object> = {
  'pb-001': {
    id: 'pb-001',
    name: 'Private Ops Office',
    slug: 'private-ops-office',
    category: 'Operations',
    category_color: '#6366F1',
    target_buyer: 'Family Office Principal',
    core_pain: 'Operational complexity across multiple entities',
    wealth_tier: 'ultra-hnw',
    delivery_model: 'dedicated',
    pricing_model: 'retainer',
    price_min: 15000,
    price_max: 45000,
    lifecycle_stage: 'mature',
    evidence_score: 92,
    wtp_score: 88,
    activation_minutes: 35,
    red_team_status: 'passed',
    readiness_pct: 95,
    voiceforge_ready: true,
    visionaudio_ready: true,
    deal_desk_ready: true,
    trust_pack_ready: true,
    kpi_count: 8,
    kpi_total: 10,
    compliance_risk: 'low',
    active_deployments: 3,
    is_template: true,
    is_custom: false,
    is_composite: false,
    citations_count: 5,

    included_items: [
      { name: 'Entity structure audit', status: 'complete' },
      { name: 'Cash flow consolidation dashboard', status: 'complete' },
      { name: 'Vendor management framework', status: 'complete' },
      { name: 'Staff onboarding playbook', status: 'complete' },
      { name: 'Insurance coverage review', status: 'complete' },
      { name: 'Regulatory filing calendar', status: 'partial' },
      { name: 'Travel & lifestyle logistics SOP', status: 'complete' },
      { name: 'Family governance charter template', status: 'partial' },
      { name: 'Cybersecurity assessment protocol', status: 'complete' },
      { name: 'Succession planning framework', status: 'missing' },
    ],

    citations: [
      {
        source: 'McKinsey Global Private Banking Survey 2025',
        type: 'industry_report',
        claim: '73% of UHNW families cite operational complexity as their top pain point',
        credibility: 'high',
      },
      {
        source: 'Family Office Exchange (FOX) Benchmarking Study',
        type: 'benchmark',
        claim: 'Dedicated ops offices reduce administrative overhead by 40% on average',
        credibility: 'high',
      },
      {
        source: 'Internal Client Outcome Data — Q4 2025',
        type: 'internal_data',
        claim: 'Clients using Private Ops Office saw 92% satisfaction score vs. 71% baseline',
        credibility: 'medium',
      },
    ],

    compatible_playbooks: [
      { id: 'pb-003', name: 'Tax Alpha Engine', synergy_score: 88 },
      { id: 'pb-006', name: 'Risk Parity Framework', synergy_score: 82 },
      { id: 'pb-008', name: 'Concierge Compliance', synergy_score: 79 },
    ],

    sop_skeleton: [
      { step: 1, title: 'Entity Mapping & Intake', duration_days: 5, owner: 'Operations Lead' },
      { step: 2, title: 'Cash Flow Integration', duration_days: 10, owner: 'Financial Analyst' },
      { step: 3, title: 'Vendor Consolidation', duration_days: 7, owner: 'Procurement Manager' },
      { step: 4, title: 'Staff & Governance Setup', duration_days: 14, owner: 'HR Partner' },
      { step: 5, title: 'Technology & Security Hardening', duration_days: 10, owner: 'CTO / CISO' },
      { step: 6, title: 'Go-Live & Monitoring', duration_days: 5, owner: 'Engagement Manager' },
    ],

    kpi_stack: [
      { name: 'Operational cost reduction', target: '25%', measurement: 'quarterly', status: 'tracking' },
      { name: 'Entity reporting cycle time', target: '< 5 days', measurement: 'monthly', status: 'tracking' },
      { name: 'Vendor invoice accuracy', target: '99%', measurement: 'monthly', status: 'tracking' },
      { name: 'Staff satisfaction score', target: '> 85', measurement: 'quarterly', status: 'tracking' },
      { name: 'Insurance coverage gap', target: '0 gaps', measurement: 'annual', status: 'tracking' },
      { name: 'Regulatory filing on-time rate', target: '100%', measurement: 'quarterly', status: 'tracking' },
      { name: 'Client satisfaction (NPS)', target: '> 80', measurement: 'quarterly', status: 'tracking' },
      { name: 'Security incident count', target: '0', measurement: 'monthly', status: 'tracking' },
      { name: 'Governance meeting cadence', target: 'Quarterly', measurement: 'quarterly', status: 'not-started' },
      { name: 'Succession plan completeness', target: '100%', measurement: 'annual', status: 'not-started' },
    ],

    objection_handling: [
      {
        objection: 'We already have an operations team in-house',
        response: 'Our framework augments your team with proven SOPs and technology integration — reducing their burden, not replacing them.',
        evidence: 'FOX study shows 62% of in-house teams lack structured governance frameworks',
      },
      {
        objection: 'The cost seems high for operational support',
        response: 'Clients typically see 25% cost reduction within the first year through vendor consolidation and process automation alone.',
        evidence: 'Internal data: average 3.2x ROI within 12 months',
      },
      {
        objection: 'We are concerned about sharing sensitive information',
        response: 'We operate under strict NDA with SOC 2 Type II compliance, encrypted data handling, and role-based access controls.',
        evidence: 'Zero data breaches across 150+ engagements since 2022',
      },
    ],

    partner_requirements: [
      { partner_type: 'Legal counsel', requirement: 'Entity structuring expertise in 3+ jurisdictions', status: 'fulfilled' },
      { partner_type: 'Technology vendor', requirement: 'Consolidated reporting platform (e.g., Addepar, Masttro)', status: 'fulfilled' },
      { partner_type: 'Insurance broker', requirement: 'UHNW specialty coverage capabilities', status: 'fulfilled' },
      { partner_type: 'Cybersecurity firm', requirement: 'SOC 2 assessment and penetration testing', status: 'pending' },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const detail = detailData[id];

  if (!detail) {
    return NextResponse.json(
      { error: 'Playbook not found', playbook_id: id },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}
