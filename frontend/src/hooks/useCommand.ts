'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NextAction {
  id: string
  type: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
}

export interface DashboardMetrics {
  total_clients: number
  active_offers: number
  revenue_mtd: number
  pipeline_value: number
  health_avg: number
  at_risk_count: number
}

export interface AgentStatus {
  name: string
  status: 'idle' | 'running' | 'error'
  last_run?: string
  next_run?: string
}

export interface DailyBrief {
  summary: string
  highlights: string[]
  alerts: string[]
  generated_at: string
}

export interface Opportunity {
  id: string
  title: string
  client_name: string
  value: number
  probability: number
  stage: string
}

export interface DashboardData {
  next_action: NextAction | null
  metrics: DashboardMetrics | null
  agent_status: AgentStatus[]
  daily_brief: DailyBrief | null
  opportunities: Opportunity[]
}

// ─── useDashboard ───────────────────────────────────────────────────────────

export interface UseDashboardOptions {
  autoRefresh?: boolean
  refreshInterval?: number // ms, default 60000
}

export function useDashboard(options?: UseDashboardOptions) {
  const { autoRefresh = false, refreshInterval = 60_000 } = options ?? {}

  const [nextAction, setNextAction] = useState<NextAction | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([])
  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<DashboardData>('/api/v1/command/dashboard')
      setNextAction(data.next_action)
      setMetrics(data.metrics)
      setAgentStatus(data.agent_status ?? [])
      setDailyBrief(data.daily_brief)
      setOpportunities(data.opportunities ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(refresh, refreshInterval)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, refreshInterval, refresh])

  return { nextAction, metrics, agentStatus, dailyBrief, opportunities, loading, error, refresh }
}
