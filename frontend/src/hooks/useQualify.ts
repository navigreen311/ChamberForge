'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  score: number
  issues: string[]
  recommendations: string[]
}

export interface BuyerProfile {
  id: string
  persona: string
  pain_points: string[]
  budget_range: { min: number; max: number }
  decision_factors: string[]
  objections: string[]
}

export interface GuardrailResult {
  passed: boolean
  violations: string[]
  warnings: string[]
  score: number
}

export interface RiskQueueItem {
  id: string
  entity_type: string
  entity_id: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// ─── useValidation ──────────────────────────────────────────────────────────

export function useValidation(problemId: string | undefined) {
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(async () => {
    if (!problemId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post(`/api/v1/qualify/validate/${problemId}`)
      setResult(data)
      return data as ValidationResult
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Validation failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [problemId])

  return { validate, result, loading, error }
}

// ─── useBuyerProfile ────────────────────────────────────────────────────────

export function useBuyerProfile() {
  const [profile, setProfile] = useState<BuyerProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (data: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const { data: resp } = await api.post('/api/v1/qualify/buyer-profile', data)
      setProfile(resp)
      return resp as BuyerProfile
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate buyer profile'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { generate, profile, loading, error }
}

// ─── useGuardrails ──────────────────────────────────────────────────────────

export function useGuardrails() {
  const [result, setResult] = useState<GuardrailResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async (offerData: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/v1/qualify/guardrails', offerData)
      setResult(data)
      return data as GuardrailResult
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Guardrail check failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { check, result, loading, error }
}

// ─── useRiskQueue ───────────────────────────────────────────────────────────

export function useRiskQueue() {
  const [items, setItems] = useState<RiskQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/qualify/risk-queue')
      setItems(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch risk queue')
    } finally {
      setLoading(false)
    }
  }, [])

  const approve = useCallback(async (id: string) => {
    setError(null)
    try {
      await api.post(`/api/v1/qualify/risk-queue/${id}/approve`)
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: 'approved' as const } : item))
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to approve item'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const reject = useCallback(async (id: string, reason: string) => {
    setError(null)
    try {
      await api.post(`/api/v1/qualify/risk-queue/${id}/reject`, { reason })
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: 'rejected' as const } : item))
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to reject item'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  useEffect(() => { fetchQueue() }, [fetchQueue])

  return { items, loading, error, approve, reject, refresh: fetchQueue }
}
