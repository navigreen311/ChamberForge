'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Problem } from '@/types'

// ─── Filters ────────────────────────────────────────────────────────────────

export interface ProblemFilters {
  wealth_tier?: Problem['wealth_tier']
  pain_category?: string
  lifecycle_stage?: string
  search?: string
  page?: number
  page_size?: number
}

// ─── useProblems ────────────────────────────────────────────────────────────

export function useProblems(filters?: ProblemFilters) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProblems = useCallback(async (f?: ProblemFilters) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/problems', { params: f || filters })
      setProblems(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch problems')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const createProblem = useCallback(async (body: Partial<Problem>) => {
    setError(null)
    try {
      const { data } = await api.post('/api/v1/problems', body)
      setProblems((prev) => [data, ...prev])
      return data as Problem
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create problem'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const updateProblem = useCallback(async (id: string, body: Partial<Problem>) => {
    setError(null)
    try {
      const { data } = await api.put(`/api/v1/problems/${id}`, body)
      setProblems((prev) => prev.map((p) => (p.id === id ? data : p)))
      return data as Problem
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update problem'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const deleteProblem = useCallback(async (id: string) => {
    setError(null)
    try {
      await api.delete(`/api/v1/problems/${id}`)
      setProblems((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete problem'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const searchProblems = useCallback(async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/problems/search', { params: { q: query } })
      setProblems(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProblems() }, [fetchProblems])

  return { problems, loading, error, fetchProblems, createProblem, updateProblem, deleteProblem, searchProblems }
}

// ─── useProblem (single) ────────────────────────────────────────────────────

export function useProblem(id: string | undefined) {
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)

    api.get(`/api/v1/problems/${id}`)
      .then(({ data }) => { if (!cancelled) setProblem(data) })
      .catch((err: any) => { if (!cancelled) setError(err.response?.data?.detail || 'Failed to fetch problem') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  return { problem, loading, error }
}
