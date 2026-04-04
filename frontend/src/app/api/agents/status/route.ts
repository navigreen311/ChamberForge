import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { name: 'Command AI', key: 'command_ai', status: 'active', last_run: '2 min ago', activity_count: 47 },
    { name: 'Research AI', key: 'research_ai', status: 'busy', last_run: 'Running now...', activity_count: 12 },
    { name: 'Problem AI', key: 'problem_ai', status: 'idle', last_run: '1 hour ago', activity_count: 8 },
    { name: 'Offer AI', key: 'offer_ai', status: 'active', last_run: '15 min ago', activity_count: 23 },
    { name: 'Pricing AI', key: 'pricing_ai', status: 'idle', last_run: '3 hours ago', activity_count: 15 },
    { name: 'Validator AI', key: 'validator_ai', status: 'active', last_run: '30 min ago', activity_count: 31 },
    { name: 'Copy AI', key: 'copy_ai', status: 'idle', last_run: '2 hours ago', activity_count: 19 },
    { name: 'Relationship AI', key: 'relationship_ai', status: 'error', last_run: 'Failed', activity_count: 5, error: 'Rate limit exceeded — retry in 12 min' },
    { name: 'Proof AI', key: 'proof_ai', status: 'idle', last_run: '4 hours ago', activity_count: 11 },
    { name: 'Fulfillment AI', key: 'fulfillment_ai', status: 'active', last_run: '8 min ago', activity_count: 7 },
  ])
}
