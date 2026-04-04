import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with actual red-team evaluation logic
// POST triggers an adversarial review of the playbook

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  return NextResponse.json({
    playbook_id: id,
    status: 'failed',
    score: 58,
    evaluated_at: new Date().toISOString(),
    checks: [
      {
        name: 'Value proposition clarity',
        status: 'pass',
        description: 'Core value proposition is clearly articulated with supporting evidence',
        recommendation: null,
      },
      {
        name: 'Pricing defensibility',
        status: 'fail',
        description: 'Price range lacks market-comparable benchmarks for this wealth tier',
        recommendation: 'Add 2-3 third-party pricing benchmarks from industry surveys (e.g., Cerulli, Capgemini)',
      },
      {
        name: 'Competitive differentiation',
        status: 'fail',
        description: 'No clear moat vs. top 3 competitors identified in the market analysis',
        recommendation: 'Conduct competitive teardown of Bessemer, Northern Trust, and Citi Private Bank offerings',
      },
      {
        name: 'Evidence strength',
        status: 'pass',
        description: 'Citations include credible industry sources with recent publication dates',
        recommendation: null,
      },
      {
        name: 'Delivery feasibility',
        status: 'warn',
        description: 'SOP timeline assumes partner availability that is not contractually guaranteed',
        recommendation: 'Secure LOIs from key delivery partners before committing to activation timeline',
      },
      {
        name: 'Compliance & regulatory risk',
        status: 'fail',
        description: 'Missing jurisdiction-specific compliance review for 2 of 4 target markets',
        recommendation: 'Complete regulatory gap analysis for Singapore and UAE jurisdictions before deployment',
      },
    ],
  });
}
