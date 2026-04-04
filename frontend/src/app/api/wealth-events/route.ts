import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { id: 'we-1', type: 'exit', description: 'Marcus Reid completed Series C exit ($120M)', timestamp: '2 hours ago', person: 'Marcus Reid' },
    { id: 'we-2', type: 'inheritance', description: 'Thornton estate transfer initiated ($45M)', timestamp: '5 hours ago', person: 'Elizabeth Thornton' },
    { id: 'we-3', type: 'ipo', description: 'Greenfield Biotech IPO — founder liquidity event', timestamp: '1 day ago', person: 'James Greenfield' },
    { id: 'we-4', type: 'board', description: 'Diana Walsh appointed to Meridian Capital board', timestamp: '2 days ago', person: 'Diana Walsh' },
    { id: 'we-5', type: 'exit', description: 'Patel family sold commercial portfolio ($28M)', timestamp: '3 days ago', person: 'Raj Patel' },
  ])
}
