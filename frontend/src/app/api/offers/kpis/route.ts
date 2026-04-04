import { NextResponse } from 'next/server';

// TODO: Replace mock data with Prisma queries
// e.g. prisma.offer.aggregate({ _sum: { monthly: true }, where: { status: 'active' } })

export async function GET() {
  const kpis = {
    mrr: 75000,
    mrr_delta: 12,
    active_count: 3,
    active_revenue: 75000,
    pipeline_value: 132000,
    draft_count: 2,
    avg_health: 81,
    critical_count: 0,
    renewals_due: 1,
    needs_attention_count: 2,
  };

  return NextResponse.json(kpis);
}
