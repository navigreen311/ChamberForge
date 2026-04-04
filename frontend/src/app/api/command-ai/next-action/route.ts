import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    priority: 'HIGH',
    confidence: 94,
    title: 'Activate Family Cyber Command for Wellington Trust',
    description:
      'The Wellington Family Trust experienced a near-miss wire fraud attempt last week. Their current cybersecurity posture has significant gaps that align perfectly with the Family Cyber Command playbook.',
    rationale:
      'FBI alert on AI voice cloning + client incident report + Deloitte FO cybersecurity survey showing 68% of family offices lack incident response plans.',
    client_tags: [
      { id: 'wt-001', name: 'Wellington Trust' },
      { id: 'sc-002', name: 'Sarah Chen' },
    ],
    estimated_impact: '$18,000/mo retainer',
    evidence_chain: [
      {
        source: 'FBI Alert IC3-2025-PSA',
        credibility: 9.2,
        claim:
          'AI-enabled voice cloning used in targeted phishing against HNW individuals',
        type: 'regulatory',
      },
      {
        source: 'Deloitte FO Cybersecurity Report 2024',
        credibility: 8.7,
        claim:
          '68% of family offices lack formal incident response plans',
        type: 'industry_report',
      },
      {
        source: 'Client Incident Log',
        credibility: 10.0,
        claim:
          'CFO received deepfake voice call attempting $2.3M wire transfer',
        type: 'internal',
      },
    ],
  };

  return NextResponse.json(data);
}
