import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with actual composition logic
// e.g. merge playbooks, detect conflicts, calculate combined pricing

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { playbook_ids } = body as { playbook_ids: string[] };

  if (!playbook_ids || !Array.isArray(playbook_ids) || playbook_ids.length < 2) {
    return NextResponse.json(
      { error: 'At least 2 playbook_ids are required' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    composite_name: 'Fortress Wealth Bundle',
    playbook_ids,
    combined_price_min: 43000,
    combined_price_max: 115000,
    merged_value_stack: [
      'Entity structure audit & optimization',
      'Multi-jurisdiction tax harvesting',
      'Risk-adjusted portfolio construction',
      'Consolidated operational dashboard',
      'Cross-border compliance monitoring',
      'Dedicated relationship manager',
      'Quarterly governance reviews',
      'Insurance & liability gap analysis',
    ],
    conflicts: [],
    sop_dependencies: [
      {
        from: 'Tax Alpha Engine — Jurisdiction mapping',
        to: 'Concierge Compliance — Regulatory filing',
        type: 'sequential',
        note: 'Tax jurisdiction mapping must complete before compliance filings begin',
      },
      {
        from: 'Private Ops Office — Entity audit',
        to: 'Tax Alpha Engine — Entity-level tax analysis',
        type: 'sequential',
        note: 'Entity structure must be documented before tax optimization',
      },
      {
        from: 'Risk Parity Framework — Portfolio assessment',
        to: 'Private Ops Office — Insurance review',
        type: 'parallel',
        note: 'Can run concurrently but share data dependencies',
      },
    ],
    partner_requirements: [
      { partner_type: 'Legal counsel', requirement: 'Entity structuring in 3+ jurisdictions', count: 2 },
      { partner_type: 'Tax advisory firm', requirement: 'Cross-border tax treaty expertise', count: 1 },
      { partner_type: 'Technology vendor', requirement: 'Consolidated reporting platform', count: 1 },
      { partner_type: 'Insurance broker', requirement: 'UHNW specialty coverage', count: 1 },
      { partner_type: 'Cybersecurity firm', requirement: 'SOC 2 assessment capability', count: 1 },
    ],
  });
}
