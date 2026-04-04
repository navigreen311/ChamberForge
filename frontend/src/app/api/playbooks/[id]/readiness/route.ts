import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with actual readiness check logic
// e.g. evaluate credentials, network, capacity, compliance, evidence per playbook

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  return NextResponse.json({
    playbook_id: id,
    score: 80,
    checks: [
      { name: 'Credentials', status: 'pass' },
      { name: 'Network', status: 'pass' },
      { name: 'Delivery capacity', status: 'pass' },
      {
        name: 'Compliance clearance',
        status: 'fail',
        reason: 'Jurisdiction check needed',
      },
      { name: 'Evidence review', status: 'pass' },
    ],
  });
}
