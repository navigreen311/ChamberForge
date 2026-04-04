import { NextResponse } from 'next/server'

// TODO: Replace with real evidence retrieval from vector store / database
// TODO: Add evidence freshness checks and auto-stale marking
// TODO: Implement contradiction detection pipeline
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const evidenceByProblem: Record<
    string,
    {
      source: string
      type: string
      publication_date: string
      credibility_score: number
      claims: string[]
      is_stale: boolean
      contradictions: string[]
    }[]
  > = {
    'prob-001': [
      {
        source: 'UBS Global Family Office Report 2025',
        type: 'Industry Report',
        publication_date: '2025-06-15',
        credibility_score: 9.2,
        claims: [
          'Average UHNW family holds assets in 4.7 jurisdictions',
          'Cross-border estate disputes increased 38% since 2022',
          'Only 31% have coordinated multi-jurisdiction estate plans',
        ],
        is_stale: false,
        contradictions: [],
      },
      {
        source: 'Deloitte Private Wealth Tax Outlook',
        type: 'Consulting Report',
        publication_date: '2025-09-01',
        credibility_score: 8.5,
        claims: [
          'Expected liability gap averages $2M-$15M per family',
          'EU DAC8 creates new reporting obligations for 2026',
        ],
        is_stale: false,
        contradictions: [],
      },
      {
        source: 'STEP Journal - Cross-Border Succession',
        type: 'Academic/Professional',
        publication_date: '2024-11-20',
        credibility_score: 7.8,
        claims: [
          'Forced heirship rules in 42 countries conflict with common-law freedom of disposition',
        ],
        is_stale: true,
        contradictions: [
          'Earlier OECD study suggested harmonization trend would reduce conflicts by 2025',
        ],
      },
    ],
    'prob-002': [
      {
        source: 'FBI Private Industry Notification PIN-20251104',
        type: 'Government Alert',
        publication_date: '2025-11-04',
        credibility_score: 9.5,
        claims: [
          'Family offices targeted at 3x rate of institutional peers',
          'Business email compromise (BEC) is the primary vector',
          'Average family office has 2.3 full-time IT staff',
        ],
        is_stale: false,
        contradictions: [],
      },
      {
        source: 'Deloitte Family Office Cybersecurity Survey 2025',
        type: 'Industry Report',
        publication_date: '2025-08-20',
        credibility_score: 9.1,
        claims: [
          'Average breach cost for family offices: $4.2M',
          '67% lack formal incident response plans',
          '43% have never conducted a penetration test',
        ],
        is_stale: false,
        contradictions: [],
      },
      {
        source: 'IC3 Annual Report 2025',
        type: 'Government Report',
        publication_date: '2026-03-10',
        credibility_score: 9.3,
        claims: [
          'Investment fraud losses exceeded $6.5B in 2025',
          'HNW individuals accounted for 22% of total losses',
        ],
        is_stale: false,
        contradictions: [],
      },
      {
        source: 'Campden Wealth - Family Office Security',
        type: 'Industry Survey',
        publication_date: '2025-05-15',
        credibility_score: 7.9,
        claims: [
          '37% of family offices experienced a cyber incident in past 12 months',
        ],
        is_stale: false,
        contradictions: [
          'Deloitte survey reports 52% incident rate - methodology differences may explain gap',
        ],
      },
    ],
    'prob-004': [
      {
        source: 'FBI Internet Crime Report Q1 2026',
        type: 'Government Report',
        publication_date: '2026-03-25',
        credibility_score: 9.4,
        claims: [
          'Deepfake-powered investment scams up 340% YoY',
          'AI-generated voice cloning used in 28% of wire fraud attempts',
        ],
        is_stale: false,
        contradictions: [],
      },
      {
        source: 'FTC Consumer Alert - AI Investment Scams',
        type: 'Regulatory Alert',
        publication_date: '2026-02-14',
        credibility_score: 8.8,
        claims: [
          'Average loss per HNW victim: $1.8M',
          'Recovery rate below 5% for AI-facilitated fraud',
        ],
        is_stale: false,
        contradictions: [],
      },
      {
        source: 'McKinsey - AI Risks in Wealth Management',
        type: 'Consulting Report',
        publication_date: '2026-01-30',
        credibility_score: 7.6,
        claims: [
          'Traditional KYC/AML tools miss 60% of AI-generated fraud patterns',
          'Estimated $12B annual exposure for HNW segment globally',
        ],
        is_stale: false,
        contradictions: [
          'FinCEN advisory suggests newer ML-based AML tools catch up to 45% - gap may be narrowing',
        ],
      },
    ],
  }

  // Default evidence for problems not explicitly mapped
  const defaultEvidence = [
    {
      source: 'Capgemini World Wealth Report 2025',
      type: 'Industry Report',
      publication_date: '2025-07-10',
      credibility_score: 8.2,
      claims: [
        'HNW population grew 5.1% globally in 2024',
        'Demand for personalized solutions at all-time high',
      ],
      is_stale: false,
      contradictions: [],
    },
    {
      source: 'McKinsey Private Banking Survey',
      type: 'Consulting Report',
      publication_date: '2025-10-05',
      credibility_score: 7.9,
      claims: [
        'Client satisfaction with current solutions below 60%',
        'Willingness to switch providers increased 15% YoY',
      ],
      is_stale: false,
      contradictions: [],
    },
    {
      source: 'Citi Wealth Outlook 2025',
      type: 'Industry Report',
      publication_date: '2025-01-15',
      credibility_score: 8.0,
      claims: [
        'Macro uncertainty driving demand for holistic risk management',
      ],
      is_stale: true,
      contradictions: [],
    },
  ]

  const evidence = evidenceByProblem[id] || defaultEvidence

  return NextResponse.json({
    problem_id: id,
    evidence,
  })
}
