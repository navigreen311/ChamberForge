import { NextResponse } from 'next/server'

const agents = [
  { id: 'agent-01', name: 'MarketMonitor', status: 'active', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-02', name: 'RiskAnalyzer', status: 'active', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-03', name: 'ComplianceGuard', status: 'active', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-04', name: 'LifeEventTracker', status: 'active', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-05', name: 'PortfolioOptimizer', status: 'idle', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-06', name: 'TaxHarvester', status: 'active', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-07', name: 'ClientInsight', status: 'active', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-08', name: 'DocumentProcessor', status: 'idle', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-09', name: 'VoiceForge', status: 'active', lastHeartbeat: new Date().toISOString() },
  { id: 'agent-10', name: 'VisionAudioForge', status: 'active', lastHeartbeat: new Date().toISOString() },
]

export async function GET() {
  return NextResponse.json(agents)
}
