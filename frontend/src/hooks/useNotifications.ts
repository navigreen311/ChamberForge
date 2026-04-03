'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import type { Notification } from '@/types'

// ─── useNotifications ───────────────────────────────────────────────────────

export interface UseNotificationsOptions {
  typeFilter?: string
  limit?: number
}

export function useNotifications(options?: UseNotificationsOptions) {
  const { typeFilter, limit = 50 } = options ?? {}

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { limit }
      if (typeFilter) params.type = typeFilter

      const { data } = await api.get('/api/v1/notifications', { params })
      const items = Array.isArray(data) ? data : data.items ?? []
      setNotifications(items)
      setUnreadCount(items.filter((n: Notification) => !n.is_read).length)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [typeFilter, limit])

  const markRead = useCallback(async (id: string) => {
    setError(null)
    try {
      await api.put(`/api/v1/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark notification as read')
    }
  }, [])

  const markAllRead = useCallback(async () => {
    setError(null)
    try {
      await api.put('/api/v1/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to mark all as read')
    }
  }, [])

  const fetchMore = useCallback(async () => {
    setError(null)
    try {
      const params: Record<string, string | number> = {
        limit,
        offset: notifications.length,
      }
      if (typeFilter) params.type = typeFilter

      const { data } = await api.get('/api/v1/notifications', { params })
      const items = Array.isArray(data) ? data : data.items ?? []
      setNotifications((prev) => [...prev, ...items])
      setUnreadCount((c) => c + items.filter((n: Notification) => !n.is_read).length)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch more notifications')
    }
  }, [typeFilter, limit, notifications.length])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  return { notifications, unreadCount, loading, error, markRead, markAllRead, fetchMore, refresh: fetchNotifications }
}
