import { NextResponse } from 'next/server';

// TODO: Replace mock data with Prisma aggregation query
// e.g. prisma.$queryRaw to get monthly MRR snapshots from offer history table

export async function GET() {
  const mrrHistory = {
    months: [
      { month: 'Oct', mrr: 52000 },
      { month: 'Nov', mrr: 58000 },
      { month: 'Dec', mrr: 61000 },
      { month: 'Jan', mrr: 64000 },
      { month: 'Feb', mrr: 68000 },
      { month: 'Mar', mrr: 75000 },
    ],
  };

  return NextResponse.json(mrrHistory);
}
