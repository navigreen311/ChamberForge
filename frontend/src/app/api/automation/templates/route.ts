import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'tpl-001', name: 'Client Onboarding Workflow', category: 'onboarding', description: 'Complete onboarding flow: welcome email, document collection, account setup, initial meeting scheduling', steps: 8, estimatedMinutes: 45, usageCount: 34, rating: 4.8 },
    { id: 'tpl-002', name: 'Quarterly Review Preparation', category: 'reviews', description: 'Auto-generate performance reports, prepare talking points, schedule client meeting, send pre-meeting summary', steps: 6, estimatedMinutes: 30, usageCount: 128, rating: 4.9 },
    { id: 'tpl-003', name: 'Risk Escalation Protocol', category: 'risk', description: 'Detect threshold breach, notify advisor chain, generate mitigation options, log compliance record', steps: 5, estimatedMinutes: 10, usageCount: 47, rating: 4.7 },
    { id: 'tpl-004', name: 'Tax-Loss Harvesting Scan', category: 'tax', description: 'Scan portfolios for harvesting opportunities, calculate tax impact, generate swap recommendations', steps: 4, estimatedMinutes: 20, usageCount: 62, rating: 4.6 },
    { id: 'tpl-005', name: 'Compliance Document Renewal', category: 'compliance', description: 'Track document expiry dates, send renewal reminders, collect e-signatures via DocuSign', steps: 5, estimatedMinutes: 15, usageCount: 89, rating: 4.5 },
    { id: 'tpl-006', name: 'Wealth Event Response', category: 'events', description: 'Detect wealth event, research context, draft advisor briefing, suggest relevant offers', steps: 6, estimatedMinutes: 25, usageCount: 156, rating: 4.8 },
    { id: 'tpl-007', name: 'Portfolio Rebalancing Alert', category: 'portfolio', description: 'Monitor drift thresholds, calculate rebalancing trades, generate client communication', steps: 4, estimatedMinutes: 15, usageCount: 210, rating: 4.7 },
    { id: 'tpl-008', name: 'Client Win-Back Campaign', category: 'retention', description: 'Identify at-risk clients, generate personalized outreach, schedule follow-ups, track engagement', steps: 7, estimatedMinutes: 35, usageCount: 18, rating: 4.3 },
  ])
}
