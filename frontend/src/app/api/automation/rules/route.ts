import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'rule-001', name: 'High-Risk Alert Escalation', trigger: 'risk_item_created', condition: 'severity === "high"', action: 'Send Slack notification to #risk-alerts and assign to senior advisor', enabled: true, lastTriggered: '2026-04-03T08:15:00Z', triggerCount: 47 },
    { id: 'rule-002', name: 'Quarterly Review Prep', trigger: 'days_before_review === 14', condition: 'client.tier in ["platinum", "gold"]', action: 'Auto-generate review materials and schedule prep meeting', enabled: true, lastTriggered: '2026-04-01T06:00:00Z', triggerCount: 128 },
    { id: 'rule-003', name: 'Wealth Event Discovery Scan', trigger: 'cron_daily_6am', condition: 'always', action: 'Run discovery scan across all monitored sources for client wealth events', enabled: true, lastTriggered: '2026-04-03T06:00:00Z', triggerCount: 365 },
    { id: 'rule-004', name: 'New Client Onboarding', trigger: 'client_created', condition: 'always', action: 'Create onboarding checklist, assign advisor, send welcome email', enabled: true, lastTriggered: '2026-03-28T10:00:00Z', triggerCount: 34 },
    { id: 'rule-005', name: 'Stale Pipeline Nudge', trigger: 'cron_weekly_monday', condition: 'opportunity.daysSinceUpdate > 21', action: 'Send advisor reminder and suggest next action', enabled: false, lastTriggered: '2026-03-24T07:00:00Z', triggerCount: 12 },
    { id: 'rule-006', name: 'Compliance Document Expiry', trigger: 'document_expiry_30d', condition: 'document.type in ["KYC", "AML", "IPS"]', action: 'Create task for advisor, notify compliance team, flag client record', enabled: true, lastTriggered: '2026-04-02T06:00:00Z', triggerCount: 89 },
  ])
}
