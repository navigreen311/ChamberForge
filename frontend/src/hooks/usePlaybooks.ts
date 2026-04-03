'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Playbook } from '@/types'

// ─── usePlaybooks (list) ────────────────────────────────────────────────────

export function usePlaybooks() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaybooks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/playbooks')
      setPlaybooks(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch playbooks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlaybooks() }, [fetchPlaybooks])

  return { playbooks, loading, error, fetchPlaybooks }
}

// ─── usePlaybook (single by slug) ───────────────────────────────────────────

export function usePlaybook(slug: string | undefined) {
  const [playbook, setPlaybook] = useState<Playbook | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)

    api.get(`/api/v1/playbooks/${slug}`)
      .then(({ data }) => { if (!cancelled) setPlaybook(data) })
      .catch((err: any) => { if (!cancelled) setError(err.response?.data?.detail || 'Failed to fetch playbook') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [slug])

  return { playbook, loading, error }
}

// ─── useActivatePlaybook ────────────────────────────────────────────────────

export function useActivatePlaybook() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activate = useCallback(async (slug: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post(`/api/v1/playbooks/${slug}/activate`)
      return data as Playbook
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to activate playbook'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { activate, loading, error }
}
