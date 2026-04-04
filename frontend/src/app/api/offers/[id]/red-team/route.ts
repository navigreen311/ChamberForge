import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace mock data with Prisma query
// e.g. prisma.redTeamResult.findFirst({ where: { offerId: id }, include: { checks: true } })

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const redTeamResult = {
    offer_id: id,
    overall_status: 'failed',
    score: 42,
    checks: [
      {
        name: 'Value Proposition Clarity',
        status: 'pass',
        description: 'The offer clearly articulates the primary value drivers and differentiators for the target client segment.',
        recommendation: null,
      },
      {
        name: 'Pricing Defensibility',
        status: 'fail',
        description: 'Pricing lacks competitive benchmarking data. No evidence of willingness-to-pay analysis or margin justification.',
        recommendation: 'Conduct pricing analysis against 3 comparable offers in the market. Add cost-to-serve breakdown to the proposal appendix.',
      },
      {
        name: 'Guarantee Risk Exposure',
        status: 'fail',
        description: 'Performance guarantee has no cap on liability. Worst-case scenario could exceed 40% of annual contract value.',
        recommendation: 'Add a remedy cap of 15-25% of quarterly fees. Redefine measurement period from rolling to fixed quarterly windows.',
      },
      {
        name: 'SOP Coverage',
        status: 'pass',
        description: 'All critical delivery workflows have documented SOPs with version control and assigned owners.',
        recommendation: null,
      },
      {
        name: 'KPI Completeness',
        status: 'fail',
        description: 'Only 4 of 12 required KPIs are defined. Missing metrics for client satisfaction, time-to-value, and retention rate.',
        recommendation: 'Define remaining 8 KPIs before moving to active status. Use the KPI template from playbook risk-management-v3.',
      },
      {
        name: 'Compliance & Regulatory Alignment',
        status: 'pass',
        description: 'Offer structure complies with current regulatory requirements. NDA and contract terms reviewed by legal.',
        recommendation: null,
      },
    ],
  };

  return NextResponse.json(redTeamResult);
}
