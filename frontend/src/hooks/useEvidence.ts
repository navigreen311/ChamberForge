'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Evidence } from '@/types'

// ─── Filters ────────────────────────────────────────────────────────────────

export interface EvidenceFilters {
  problem_id?: string
  source_type?: Evidence['source_type']
  min_credibility?: number
  page?: number
  page_size?: number
}

// ─── useEvidence ────────────────────────────────────────────────────────────

export function useEvidence(filters?: EvidenceFilters) {
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvidence = useCallback(async (f?: EvidenceFilters) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/evidence', { params: f || filters })
      setEvidences(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch evidence')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchEvidence() }, [fetchEvidence])

  return { evidences, loading, error, fetchEvidence }
}

// ─── useAnalystQueue ────────────────────────────────────────────────────────

export interface AnalystQueueItem {
  id: string
  evidence_id: string
  status: string
  assigned_to?: string
  created_at: string
}

export function useAnalystQueue() {
  const [items, setItems] = useState<AnalystQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/evidence/analyst-queue')
      setItems(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch analyst queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchQueue() }, [fetchQueue])

  return { items, loading, error, refresh: fetchQueue }
}

// ─── useIngestSource ────────────────────────────────────────────────────────

export function useIngestSource() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Evidence | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ingest = useCallback(async (text: string, type: Evidence['source_type']) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/v1/evidence/ingest', { text, source_type: type })
      setResult(data)
      return data as Evidence
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Ingestion failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { ingest, loading, result, error }
}
