export interface KPIMetric {
  value: number
  trend: string
  direction: 'up' | 'down'
}

export interface KPIData {
  active_clients: KPIMetric
  monthly_retainer: KPIMetric
  pipeline_value: KPIMetric
  avg_health_score: KPIMetric
  wealth_events: KPIMetric
  risk_queue: KPIMetric
}

export interface EvidenceItem {
  source: string
  credibility: number
  claim: string
  type: 'regulatory' | 'industry_report' | 'internal' | 'peer_reviewed'
}

export interface ClientTag {
  id: string
  name: string
}

export interface NextAction {
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  confidence: number
  title: string
  description: string
  rationale: string
  client_tags: ClientTag[]
  estimated_impact: string
  evidence_chain: EvidenceItem[]
}

export interface ClientHealth {
  id: string
  name: string
  score: number
  status: string
  category: 'healthy' | 'warning' | 'critical' | 'new'
}

export interface Opportunity {
  rank: number
  problem: string
  tier: 'UHNW' | 'HNW'
  lifecycle: 'Emerging' | 'Accelerating' | 'Proven' | 'Saturated'
  offer: string | null
  probability: number
  impact: number
  composite: number
  stage: 'validate' | 'build' | 'review' | 'close'
}

export interface WealthEvent {
  id: string
  type: 'exit' | 'inheritance' | 'ipo' | 'board'
  description: string
  timestamp: string
  person: string
}

export interface Alert {
  severity: 'critical' | 'high' | 'medium'
  message: string
}

export interface ActionItem {
  id: string
  text: string
  priority: 'critical' | 'high' | 'medium'
  done: boolean
}

export interface DailyBriefData {
  date: string
  changes: string[]
  alerts: Alert[]
  actions: ActionItem[]
}

export interface AgentStatus {
  name: string
  key: string
  status: 'active' | 'busy' | 'idle' | 'error'
  last_run: string
  activity_count: number
  error?: string
}

export interface RiskQueueItem {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high'
  module: string
  created_at: string
}

export interface IntegrationInfo {
  connected: boolean
  modules_active: number
  name: string
}

export interface IntegrationsData {
  voiceforge: IntegrationInfo
  visionaudioforge: IntegrationInfo
}
