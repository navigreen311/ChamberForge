'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Client } from '@/types'

/**
 * Client data for the Clients screen.
 *
 * P-20 (T-027, T-053). This hook called **an endpoint that has never
 * existed**. Every operation went to `/api/v1/clients` on FastAPI, and there
 * is no `clients.py` router in that codebase — only `clients_dashboard.py`,
 * which is one of the three routers reachable solely through the
 * `api/v1/router.py` that P-00 deleted. So `fetchClients` 404'd on every
 * call, and the screen showed `'Failed to fetch clients'` or nothing at all.
 *
 * Under D4 the BFF reads Prisma directly and never needs that FastAPI route.
 * The reads now go to `/api/clients` and `/api/clients/[id]/detail`, which
 * this package implements.
 *
 * `lib/api.ts` is deliberately not used here. It is P-11's axios instance
 * with its base URL pointed at FastAPI, and these are same-origin BFF routes
 * — `fetch` is the correct client for them, and the session travels as the
 * NextAuth cookie either way.
 *
 * **The mutations still have no endpoint on either stack.** `POST`, `PUT`
 * and `DELETE` for a client exist in neither FastAPI nor the BFF, and
 * building them is not in this package's card. They now reject with a
 * message that says so, instead of producing `'Failed to create client'`
 * from a 404 — a developer should be able to tell "this feature was never
 * built" from "the request failed". See the escalation.
 */

const NO_WRITE_ENDPOINT =
  'Client create, update and delete are not implemented. No endpoint exists on either stack.'

export interface ClientFilters {
  status?: string
  tier?: string
  pain_category?: string
  trust_channel?: string
  q?: string
  sort?: string
  page?: number
  limit?: number
}

function toQuery(filters?: ClientFilters): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export interface ClientListMeta {
  total: number
  page: number
  limit: number
  total_pages: number
  sort: string
}

export function useClients(filters?: ClientFilters) {
  const [clients, setClients] = useState<Client[]>([])
  const [meta, setMeta] = useState<ClientListMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Serialised, because `filters` is normally an object literal at the call
  // site and so a new reference on every render. Depending on the object
  // itself makes `fetchClients` new each render, which re-runs the effect,
  // which sets state, which renders again - an unbounded fetch loop that
  // fires the moment a caller passes any filter at all. The original hook had
  // the same shape; the tests in this package are what surfaced it.
  const filterKey = useMemo(() => JSON.stringify(filters ?? {}), [filters])

  const fetchClients = useCallback(
    async (f?: ClientFilters) => {
      setLoading(true)
      setError(null)
      try {
        const active = f ?? (JSON.parse(filterKey) as ClientFilters)
        const response = await fetch(`/api/clients${toQuery(active)}`)

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          // An unauthenticated read is a distinct state, not an empty book.
          // The screen must render an error rather than "no clients", which
          // would read as "this operator has none".
          setError(body.message ?? `Failed to fetch clients (${response.status})`)
          setClients([])
          setMeta(null)
          return
        }

        const body = await response.json()
        setClients(body.data ?? [])
        setMeta(body.meta ?? null)
      } catch {
        setError('Failed to fetch clients')
        setClients([])
        setMeta(null)
      } finally {
        setLoading(false)
      }
    },
    [filterKey]
  )

  const notImplemented = useCallback(async (): Promise<never> => {
    setError(NO_WRITE_ENDPOINT)
    throw new Error(NO_WRITE_ENDPOINT)
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return {
    clients,
    meta,
    loading,
    error,
    fetchClients,
    createClient: notImplemented,
    updateClient: notImplemented,
    deleteClient: notImplemented,
  }
}

// ─── useClient (single) ─────────────────────────────────────────────────────

export function useClient(id: string | undefined) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/clients/${encodeURIComponent(id)}/detail`)
      .then(async (response) => {
        if (cancelled) return
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setError(body.message ?? `Failed to fetch client (${response.status})`)
          setClient(null)
          return
        }
        setClient(await response.json())
      })
      .catch(() => {
        if (!cancelled) setError('Failed to fetch client')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  return { client, loading, error }
}
