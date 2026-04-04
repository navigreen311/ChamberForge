import { NextResponse } from 'next/server'

// TODO: Replace with real trend detection from NLP pipeline
// TODO: Add time-series data for trend sparklines
// TODO: Implement trend correlation with problem urgency scores
export async function GET() {
  const trends = [
    {
      id: 'trend-001',
      name: 'AI-Powered Financial Fraud',
      category: 'Risk & Security',
      severity: 'hot' as const,
      source: 'FBI/IC3 + FTC Alerts',
      direction: '↑↑',
    },
    {
      id: 'trend-002',
      name: 'Cross-Border Tax Enforcement',
      category: 'Regulatory & Compliance',
      severity: 'rising' as const,
      source: 'OECD BEPS + EU DAC8',
      direction: '↑',
    },
    {
      id: 'trend-003',
      name: 'Family Office Cyber Attacks',
      category: 'Risk & Security',
      severity: 'hot' as const,
      source: 'Deloitte + FBI PIN',
      direction: '↑↑',
    },
    {
      id: 'trend-004',
      name: 'Tokenized Real-World Assets',
      category: 'Portfolio Management',
      severity: 'new' as const,
      source: 'McKinsey + Citi Research',
      direction: '★',
    },
    {
      id: 'trend-005',
      name: 'Next-Gen Wealth Transfer Wave',
      category: 'Legacy & Succession',
      severity: 'rising' as const,
      source: 'UBS + Capgemini WWR',
      direction: '↑',
    },
    {
      id: 'trend-006',
      name: 'ESG/Impact Measurement Standards',
      category: 'Philanthropy & Impact',
      severity: 'stable' as const,
      source: 'GIIN + McKinsey',
      direction: '→',
    },
    {
      id: 'trend-007',
      name: 'Longevity Planning Demand',
      category: 'Lifestyle & Wellness',
      severity: 'rising' as const,
      source: 'PubMed + Mercer Health',
      direction: '↑',
    },
    {
      id: 'trend-008',
      name: 'Direct Lending to HNW Borrowers',
      category: 'Portfolio Management',
      severity: 'new' as const,
      source: 'Preqin + PitchBook',
      direction: '★',
    },
  ]

  return NextResponse.json(trends)
}
