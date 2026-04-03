import { renderHook, waitFor } from '@testing-library/react'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

import { useRevenue, useSubscriptions } from '@/hooks/useBilling'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

describe('useRevenue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches revenue on mount', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: { total: 50000, mrr: 5000, arr: 60000, growth_rate: 12, period: 'monthly' },
    })

    const { result } = renderHook(() => useRevenue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/billing/revenue')
    expect(result.current.revenue?.mrr).toBe(5000)
  })

  it('sets error on failure', async () => {
    ;(mockApi.get as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Billing unavailable' } },
    })

    const { result } = renderHook(() => useRevenue())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Billing unavailable')
    expect(result.current.revenue).toBeNull()
  })
})

describe('useSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches subscriptions on mount', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: [
        { id: 's1', plan: 'pro', status: 'active', amount: 99 },
        { id: 's2', plan: 'basic', status: 'trialing', amount: 29 },
      ],
    })

    const { result } = renderHook(() => useSubscriptions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/billing/subscriptions')
    expect(result.current.subscriptions).toHaveLength(2)
  })

  it('sets error on failure', async () => {
    ;(mockApi.get as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Forbidden' } },
    })

    const { result } = renderHook(() => useSubscriptions())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Forbidden')
  })

  it('handles paginated items response', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: { items: [{ id: 's1' }], total: 1 },
    })

    const { result } = renderHook(() => useSubscriptions())

    await waitFor(() => {
      expect(result.current.subscriptions).toHaveLength(1)
    })
  })
})
