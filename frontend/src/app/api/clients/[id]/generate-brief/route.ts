import { NextRequest, NextResponse } from 'next/server'

const clientNames: Record<string, string> = {
  'c-001': 'Jonathan Wellington III',
  'c-002': 'Hiroshi Nakamura',
  'c-003': 'Elena Rivera',
  'c-004': 'Margaret Thornton',
  'c-005': 'David Chen',
  'c-006': 'Sophia Andersen',
  'c-007': 'Robert Kingsley',
  'c-008': 'Aisha Patel',
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { brief_type, meeting_context } = body
  const clientName = clientNames[params.id] || 'Unknown Client'

  if (!brief_type) {
    return NextResponse.json(
      { error: 'brief_type is required' },
      { status: 400 }
    )
  }

  const briefId = `brief-${params.id}-${Date.now()}`

  const briefs: Record<string, object> = {
    'pre-meeting': {
      summary: `${clientName} is a high-priority relationship with evolving needs. ${meeting_context ? `Meeting context: ${meeting_context}.` : ''} Focus on demonstrating value continuity and addressing recent pain signals before renewal discussion.`,
      pain_signals: [
        'Declining engagement — health score trending down over past 30 days',
        'Spouse expressed concern about consolidated reporting gaps',
        'Delayed response to last two follow-up emails suggests potential dissatisfaction',
      ],
      conversation_opener: `"${clientName.split(' ')[0]}, I wanted to make sure we\'re fully aligned on your priorities heading into Q2. I\'ve prepared some updates I think you\'ll find valuable."`,
      objections: [
        { objection: 'Fees are too high for what we receive', response: 'Walk through the value delivered this quarter — tax savings of $180K, estate restructuring completed, 3 vendor negotiations closed.' },
        { objection: 'Other firms offer more technology', response: 'Demo the new household dashboard and consolidated reporting features launching next month.' },
        { objection: 'We don\'t need this level of service', response: 'Reference the upcoming estate tax legislation changes that will require proactive planning.' },
      ],
      proof_assets: [
        'Q1 2026 Performance Report — net savings of $180K',
        'Estate Tax Reform Impact Analysis (March 2026)',
        'Household Complexity Score benchmark vs. peer families',
        'Client satisfaction survey results (92nd percentile)',
      ],
    },
    'renewal': {
      summary: `Renewal preparation brief for ${clientName}. Current retainer relationship with ${meeting_context ? meeting_context : 'standard renewal terms'}. Health score indicates need for proactive value demonstration.`,
      pain_signals: [
        'Renewal approaching within 73 days — requires proactive engagement',
        'KPI coverage at 67% — 2 of 6 KPIs not yet defined',
        'No wealth event to anchor renewal value proposition',
      ],
      conversation_opener: `"${clientName.split(' ')[0]}, as we approach our renewal, I want to share a comprehensive review of what we\'ve accomplished together and where I see our biggest opportunities ahead."`,
      objections: [
        { objection: 'Want to reduce retainer scope', response: 'Present the cost-of-inaction analysis showing risks of reducing coverage.' },
        { objection: 'Considering other advisors', response: 'Highlight institutional knowledge, family relationships, and transition costs.' },
      ],
      proof_assets: [
        'Annual Value Delivery Report — full year impact summary',
        'Peer comparison benchmarking analysis',
        'Forward-looking opportunity roadmap for next 12 months',
      ],
    },
    'quarterly-review': {
      summary: `Quarterly review brief for ${clientName}. ${meeting_context ? meeting_context : 'Standard Q1 2026 review.'} Prepare to cover portfolio performance, KPI progress, and upcoming milestones.`,
      pain_signals: [
        'Portfolio underperformed benchmark by 1.2% in Q1',
        'Two action items from last quarter still pending completion',
      ],
      conversation_opener: `"${clientName.split(' ')[0]}, I\'m excited to walk you through our Q1 progress. We have some strong wins to celebrate and a few areas where I want to get your input on next steps."`,
      objections: [
        { objection: 'Portfolio performance is lagging', response: 'Context: market conditions, risk-adjusted returns, and long-term trajectory still on track.' },
      ],
      proof_assets: [
        'Q1 2026 Portfolio Performance Report',
        'KPI Scorecard — 4 of 6 targets met or exceeded',
        'Market Outlook Brief — Q2 2026',
      ],
    },
  }

  const briefData = briefs[brief_type] || briefs['pre-meeting']

  return NextResponse.json({
    brief_id: briefId,
    sections: briefData,
  })
}
