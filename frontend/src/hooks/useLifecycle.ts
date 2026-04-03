'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Client } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface IntelBrief {
  id: string
  client_id: string
  summary: string
  key_insights: string[]
  risk_factors: string[]
  opportunities: string[]
  generated_at: string
}

export interface ClientHealthItem {
  client: Client
  health_score: number
  trend: 'improving' | 'stable' | 'declining'
  last_interaction: string
  alerts: string[]
}

export interface ScenarioParams {
  client_id?: string
  scenario_type: string
  variables: Record<string, unknown>
}

export interface ScenarioResult {
  id: string
  scenario_type: string
  outcomes: { label: string; probability: number; impact: string }[]
  recommendations: string[]
  generated_at: string
}

// ─── useIntelBrief ──────────────────────────────────────────────────────────

export function useIntelBrief(clientId: string | undefined) {
  const [brief, setBrief] = useState<IntelBrief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post(`/api/v1/lifecycle/intel-brief/${clientId}`)
      setBrief(data)
      return data as IntelBrief
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate intel brief'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  return { generate, brief, loading, error }
}

// ─── useClientHealth ────────────────────────────────────────────────────────

export function useClientHealth() {
  const [clients, setClients] = useState<ClientHealthItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/lifecycle/client-health')
      setClients(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch client health')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHealth() }, [fetchHealth])

  return { clients, loading, error, refresh: fetchHealth }
}

// ─── useScenario ────────────────────────────────────────────────────────────

export function useScenario() {
  const [results, setResults] = useState<ScenarioResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (params: ScenarioParams) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/v1/lifecycle/scenarios', params)
      setResults(data)
      return data as ScenarioResult
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Scenario analysis failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, results, loading, error }
}
