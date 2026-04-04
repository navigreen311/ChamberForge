'use client'
import { useState, useEffect, useCallback } from 'react'

interface DashboardData {
  kpis: any | null
  nextAction: any | null
  clientHealth: any[] | null
  opportunities: any[] | null
  wealthEvents: any[] | null
  dailyBrief: any | null
  agentStatus: any[] | null
  riskQueue: any[] | null
  integrations: any | null
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    kpis: null, nextAction: null, clientHealth: null, opportunities: null,
    wealthEvents: null, dailyBrief: null, agentStatus: null, riskQueue: null, integrations: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [kpis, nextAction, clientHealth, opportunities, wealthEvents, dailyBrief, agentStatus, riskQueue, integrations] = await Promise.allSettled([
        fetch('/api/dashboard/kpis').then(r => r.json()),
        fetch('/api/command-ai/next-action').then(r => r.json()),
        fetch('/api/clients/health-summary').then(r => r.json()),
        fetch('/api/opportunities/ranked').then(r => r.json()),
        fetch('/api/wealth-events').then(r => r.json()),
        fetch('/api/daily-brief/today').then(r => r.json()),
        fetch('/api/agents/status').then(r => r.json()),
        fetch('/api/risk-queue').then(r => r.json()),
        fetch('/api/integrations/status').then(r => r.json()),
      ])

      setData({
        kpis: kpis.status === 'fulfilled' ? kpis.value : null,
        nextAction: nextAction.status === 'fulfilled' ? nextAction.value : null,
        clientHealth: clientHealth.status === 'fulfilled' ? clientHealth.value : null,
        opportunities: opportunities.status === 'fulfilled' ? opportunities.value : null,
        wealthEvents: wealthEvents.status === 'fulfilled' ? wealthEvents.value : null,
        dailyBrief: dailyBrief.status === 'fulfilled' ? dailyBrief.value : null,
        agentStatus: agentStatus.status === 'fulfilled' ? agentStatus.value : null,
        riskQueue: riskQueue.status === 'fulfilled' ? riskQueue.value : null,
        integrations: integrations.status === 'fulfilled' ? integrations.value : null,
      })
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAll, 60000)
    return () => clearInterval(interval)
  }, [fetchAll])

  return { ...data, loading, error, refresh: fetchAll }
}
