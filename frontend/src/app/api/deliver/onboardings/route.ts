import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      client: 'Marcus Reid',
      week: 2,
      total_weeks: 8,
      stage: 'Household Graph Setup',
      progress: 25,
    },
  ])
}
