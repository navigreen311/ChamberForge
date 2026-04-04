import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 'rq-1',
      title: 'Medical navigation offer references licensed care',
      description:
        'Offer copy suggests direct medical advice. Guardrails Engine flagged regulated domain.',
      severity: 'critical',
      module: 'Guardrails Engine',
      created_at: '1 hour ago',
    },
    {
      id: 'rq-2',
      title: 'Cross-border data handling — EU/US transfer',
      description:
        'Client household spans 3 jurisdictions. Geo Intelligence flagged GDPR compliance check needed.',
      severity: 'high',
      module: 'Geo Intelligence',
      created_at: '3 hours ago',
    },
    {
      id: 'rq-3',
      title: 'Guarantee language in Ecosystem Orchestrator offer',
      description:
        'AI Explainability Layer flagged specific outcome promises that need review.',
      severity: 'high',
      module: 'AI Explainability',
      created_at: '5 hours ago',
    },
  ])
}
