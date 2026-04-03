'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

export type SearchIndex = 'all' | 'problems' | 'offers' | 'clients' | 'playbooks' | 'evidence'

export interface SearchResult {
  id: string
  index: SearchIndex
  title: string
  snippet: string
  score: number
  url: string
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  page_size: number
}

// ─── useSearch ──────────────────────────────────────────────────────────────

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState<SearchIndex>('all')
  const [page, setPage] = useState(1)

  const search = useCallback(async (q?: string, idx?: SearchIndex, p?: number) => {
    const searchQuery = q ?? query
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<SearchResponse>('/api/v1/search', {
        params: {
          q: searchQuery,
          index: idx ?? index,
          page: p ?? page,
          page_size: 20,
        },
      })
      setResults(data.results ?? [])
      setTotal(data.total ?? 0)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [query, index, page])

  return { query, setQuery, results, total, loading, error, index, setIndex, page, setPage, search }
}
