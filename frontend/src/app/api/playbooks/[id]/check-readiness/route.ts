import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with actual readiness evaluation logic
// POST triggers a fresh readiness check (re-evaluates all criteria)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Simulate fresh check with timestamp
  return NextResponse.json({
    playbook_id: id,
    score: 80,
    checked_at: new Date().toISOString(),
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
