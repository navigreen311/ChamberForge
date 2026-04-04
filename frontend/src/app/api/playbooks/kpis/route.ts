import { NextResponse } from 'next/server';

// TODO: Replace mock data with Prisma aggregation queries

export async function GET() {
  return NextResponse.json({
    total: 12,
    templates: 10,
    custom: 2,
    active_deployments: 5,
    revenue_generated: 75000,
    most_used: 'Private Ops Office',
    avg_activation_minutes: 42,
  });
}
