import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'usr-001', name: 'Sarah Chen', email: 'sarah.chen@meridianwealth.com', role: 'admin', avatar: '/avatars/sarah.jpg', status: 'active', lastActive: '2026-04-03T09:12:00Z', joinedAt: '2024-08-15T00:00:00Z' },
    { id: 'usr-002', name: 'Marcus Rivera', email: 'marcus.rivera@meridianwealth.com', role: 'advisor', avatar: '/avatars/marcus.jpg', status: 'active', lastActive: '2026-04-03T08:45:00Z', joinedAt: '2024-11-01T00:00:00Z' },
    { id: 'usr-003', name: 'Emily Nakamura', email: 'emily.nakamura@meridianwealth.com', role: 'advisor', avatar: '/avatars/emily.jpg', status: 'active', lastActive: '2026-04-02T17:30:00Z', joinedAt: '2025-02-10T00:00:00Z' },
    { id: 'usr-004', name: 'David Okafor', email: 'david.okafor@meridianwealth.com', role: 'analyst', avatar: '/avatars/david.jpg', status: 'invited', lastActive: null, joinedAt: '2026-03-28T00:00:00Z' },
  ])
}
