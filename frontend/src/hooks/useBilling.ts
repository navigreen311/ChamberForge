'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Revenue {
  total: number
  mrr: number
  arr: number
  growth_rate: number
  period: string
}

export interface Subscription {
  id: string
  client_id: string
  plan: string
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  amount: number
  currency: string
  current_period_start: string
  current_period_end: string
}

export interface Invoice {
  id: string
  client_id: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
  due_date: string
  paid_at?: string
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  status: 'pending' | 'converted' | 'expired'
  reward_amount?: number
  created_at: string
}

// ─── useRevenue ─────────────────────────────────────────────────────────────

export function useRevenue() {
  const [revenue, setRevenue] = useState<Revenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRevenue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/billing/revenue')
      setRevenue(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch revenue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRevenue() }, [fetchRevenue])

  return { revenue, loading, error, refresh: fetchRevenue }
}

// ─── useSubscriptions ───────────────────────────────────────────────────────

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/billing/subscriptions')
      setSubscriptions(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch subscriptions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSubscriptions() }, [fetchSubscriptions])

  return { subscriptions, loading, error, refresh: fetchSubscriptions }
}

// ─── useInvoices ────────────────────────────────────────────────────────────

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/billing/invoices')
      setInvoices(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  return { invoices, loading, error, refresh: fetchInvoices }
}

// ─── useReferrals ───────────────────────────────────────────────────────────

export function useReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReferrals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/api/v1/billing/referrals')
      setReferrals(Array.isArray(data) ? data : data.items ?? [])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch referrals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReferrals() }, [fetchReferrals])

  return { referrals, loading, error, refresh: fetchReferrals }
}
