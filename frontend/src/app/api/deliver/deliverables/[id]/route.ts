import { NextRequest, NextResponse } from 'next/server'

const deliverableDetail = {
  'del-001': {
    id: 'del-001',
    name: 'Incident Response Plan',
    type: 'Security',
    type_color: '#ef4444',
    client_name: 'Wellington Trust',
    client_id: 'cli-001',
    priority: 'critical',
    status: 'overdue',
    sla_date: '2026-04-01',
    sla_status: 'breached',
    sla_days: -2,
    assignee_name: 'Sarah Chen',
    assignee_initials: 'SC',
    qa_score: 3,
    qa_total: 5,
    portal_status: 'pending',
    visionaudio_status: 'complete',
    voiceforge_status: 'scheduled',
    notes: 'Awaiting legal review before final delivery',
    created_at: '2026-03-15T09:00:00Z',
    revision_history: [
      {
        id: 'rev-001',
        version: 1,
        author: 'Sarah Chen',
        date: '2026-03-15T09:00:00Z',
        summary: 'Initial draft created from template',
      },
      {
        id: 'rev-002',
        version: 2,
        author: 'Sarah Chen',
        date: '2026-03-22T14:30:00Z',
        summary: 'Added threat classification matrix and escalation tiers',
      },
      {
        id: 'rev-003',
        version: 3,
        author: 'James Miller',
        date: '2026-03-28T11:00:00Z',
        summary: 'Legal review feedback incorporated — pending final sign-off',
      },
    ],
    qa_items: [
      { id: 'qa-001', label: 'Completeness check', passed: true },
      { id: 'qa-002', label: 'Formatting & branding', passed: true },
      { id: 'qa-003', label: 'Data accuracy verified', passed: true },
      { id: 'qa-004', label: 'Client-specific customization', passed: false },
      { id: 'qa-005', label: 'Compliance review', passed: false },
    ],
    portal_delivery_log: {
      portal_id: 'portal-wellington',
      last_synced: '2026-03-28T16:00:00Z',
      delivery_attempts: [
        { date: '2026-03-28T16:00:00Z', status: 'pending', note: 'Queued for delivery after QA pass' },
      ],
    },
  },
  'del-002': {
    id: 'del-002',
    name: 'Monthly Report',
    type: 'Report',
    type_color: '#3b82f6',
    client_name: 'Elizabeth Thornton',
    client_id: 'cli-002',
    priority: 'medium',
    status: 'overdue',
    sla_date: '2026-04-02',
    sla_status: 'breached',
    sla_days: -1,
    assignee_name: 'James Miller',
    assignee_initials: 'JM',
    qa_score: 4,
    qa_total: 5,
    portal_status: 'active',
    visionaudio_status: 'complete',
    voiceforge_status: 'complete',
    notes: 'Final charts pending review',
    created_at: '2026-03-20T10:30:00Z',
    revision_history: [
      {
        id: 'rev-004',
        version: 1,
        author: 'James Miller',
        date: '2026-03-20T10:30:00Z',
        summary: 'Auto-generated from data pipeline',
      },
      {
        id: 'rev-005',
        version: 2,
        author: 'James Miller',
        date: '2026-03-30T09:00:00Z',
        summary: 'Updated performance charts and commentary',
      },
    ],
    qa_items: [
      { id: 'qa-006', label: 'Completeness check', passed: true },
      { id: 'qa-007', label: 'Formatting & branding', passed: true },
      { id: 'qa-008', label: 'Data accuracy verified', passed: true },
      { id: 'qa-009', label: 'Client-specific customization', passed: true },
      { id: 'qa-010', label: 'Compliance review', passed: false },
    ],
    portal_delivery_log: {
      portal_id: 'portal-thornton',
      last_synced: '2026-03-30T12:00:00Z',
      delivery_attempts: [
        { date: '2026-03-30T12:00:00Z', status: 'delivered', note: 'Draft shared for preview' },
        { date: '2026-04-01T08:00:00Z', status: 'pending', note: 'Final version awaiting QA completion' },
      ],
    },
  },
}

type DetailKey = keyof typeof deliverableDetail

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const detail = deliverableDetail[params.id as DetailKey]

  if (!detail) {
    return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
  }

  return NextResponse.json(detail)
}
