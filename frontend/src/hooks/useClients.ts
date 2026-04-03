'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Client } from '@/types'

// ─── useClients (list + CRUD) ───────────────────────────────────────────────

export interface ClientFilters {
  status?: Client['status']
  wealth_tier?: string
  search?: string
  page?: number
  page_size?: number
}

export function useClients(filters?: ClientFilters) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async (f?: ClientFilters) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/clients', { params: f || filters })
      setClients(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const createClient = useCallback(async (body: Partial<Client>) => {
    setError(null)
    try {
      const { data } = await api.post('/api/v1/clients', body)
      setClients((prev) => [data, ...prev])
      return data as Client
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create client'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const updateClient = useCallback(async (id: string, body: Partial<Client>) => {
    setError(null)
    try {
      const { data } = await api.put(`/api/v1/clients/${id}`, body)
      setClients((prev) => prev.map((c) => (c.id === id ? data : c)))
      return data as Client
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update client'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    setError(null)
    try {
      await api.delete(`/api/v1/clients/${id}`)
      setClients((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete client'
      setError(msg)
      throw new Error(msg)
    }
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  return { clients, loading, error, fetchClients, createClient, updateClient, deleteClient }
}

// ─── useClient (single) ─────────────────────────────────────────────────────

export function useClient(id: string | undefined) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)

    api.get(`/api/v1/clients/${id}`)
      .then(({ data }) => { if (!cancelled) setClient(data) })
      .catch((err: any) => { if (!cancelled) setError(err.response?.data?.detail || 'Failed to fetch client') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  return { client, loading, error }
}
