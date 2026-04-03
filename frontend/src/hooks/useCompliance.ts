'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { ConsentRecord } from '@/types'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SLA {
  id: string
  offer_id: string
  response_time_hours: number
  resolution_time_hours: number
  uptime_guarantee: number
  penalty_terms: string
  status: 'draft' | 'active' | 'expired'
  created_at: string
}

// ─── useConsent ─────────────────────────────────────────────────────────────

export function useConsent(clientId: string | undefined) {
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConsents = useCallback(async () => {
    if (!clientId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/v1/compliance/consent/${clientId}`)
      setConsents(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch consents')
    } finally {
      setLoading(false)
    }
  }, [clientId])

  const grant = useCallback(async (type: string) => {
    if (!clientId) return
    setError(null)
    try {
      const { data } = await api.post(`/api/v1/compliance/consent/${clientId}`, { consent_type: type })
      setConsents((prev) => [...prev, data])
      return data as ConsentRecord
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to grant consent'
      setError(msg)
      throw new Error(msg)
    }
  }, [clientId])

  const revoke = useCallback(async (id: string) => {
    setError(null)
    try {
      await api.delete(`/api/v1/compliance/consent/${clientId}/${id}`)
      setConsents((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to revoke consent'
      setError(msg)
      throw new Error(msg)
    }
  }, [clientId])

  useEffect(() => { fetchConsents() }, [fetchConsents])

  return { consents, loading, error, grant, revoke, refresh: fetchConsents }
}

// ─── useSLA ─────────────────────────────────────────────────────────────────

export function useSLA(offerId: string | undefined) {
  const [sla, setSla] = useState<SLA | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!offerId) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)

    api.get(`/api/v1/compliance/sla/${offerId}`)
      .then(({ data }) => { if (!cancelled) setSla(data) })
      .catch((err: any) => { if (!cancelled) setError(err.response?.data?.detail || 'Failed to fetch SLA') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [offerId])

  return { sla, loading, error }
}
