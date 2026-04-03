'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Offer, PricingModel } from '@/types'

// ─── useOffers (list) ───────────────────────────────────────────────────────

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/offers')
      setOffers(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOffers() }, [fetchOffers])

  return { offers, loading, error, fetchOffers }
}

// ─── useOffer (single) ──────────────────────────────────────────────────────

export function useOffer(id: string | undefined) {
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)

    api.get(`/api/v1/offers/${id}`)
      .then(({ data }) => { if (!cancelled) setOffer(data) })
      .catch((err: any) => { if (!cancelled) setError(err.response?.data?.detail || 'Failed to fetch offer') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [id])

  return { offer, loading, error }
}

// ─── useGenerateOffer ───────────────────────────────────────────────────────

export function useGenerateOffer() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Offer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (problemData: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/api/v1/offers/generate', problemData)
      setResult(data)
      return data as Offer
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate offer'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return { generate, loading, result, error }
}

// ─── useOfferPricing ────────────────────────────────────────────────────────

export function useOfferPricing(offerId: string | undefined) {
  const [pricing, setPricing] = useState<PricingModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPricing = useCallback(async () => {
    if (!offerId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/v1/offers/${offerId}/pricing`)
      setPricing(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch pricing')
    } finally {
      setLoading(false)
    }
  }, [offerId])

  const generatePricing = useCallback(async () => {
    if (!offerId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post(`/api/v1/offers/${offerId}/pricing/generate`)
      setPricing(data)
      return data as PricingModel
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate pricing'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [offerId])

  useEffect(() => { fetchPricing() }, [fetchPricing])

  return { pricing, loading, error, generatePricing }
}
