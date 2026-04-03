import { renderHook, act, waitFor } from '@testing-library/react'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

import { useOffers, useGenerateOffer } from '@/hooks/useOffers'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

describe('useOffers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches offers on mount', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: [{ id: '1', name: 'Offer A' }],
    })

    const { result } = renderHook(() => useOffers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/offers')
    expect(result.current.offers).toHaveLength(1)
  })

  it('sets error on fetch failure', async () => {
    ;(mockApi.get as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Unauthorized' } },
    })

    const { result } = renderHook(() => useOffers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Unauthorized')
  })

  it('handles paginated response with items key', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: { items: [{ id: '1' }, { id: '2' }], total: 2 },
    })

    const { result } = renderHook(() => useOffers())

    await waitFor(() => {
      expect(result.current.offers).toHaveLength(2)
    })
  })
})

describe('useGenerateOffer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls POST to generate offer', async () => {
    ;(mockApi.post as jest.Mock).mockResolvedValue({
      data: { id: 'gen1', name: 'Generated' },
    })

    const { result } = renderHook(() => useGenerateOffer())

    await act(async () => {
      const offer = await result.current.generate({ problem_id: '1' })
      expect(offer.id).toBe('gen1')
    })

    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/offers/generate', { problem_id: '1' })
  })

  it('sets error on generate failure', async () => {
    ;(mockApi.post as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Generation failed' } },
    })

    const { result } = renderHook(() => useGenerateOffer())

    let thrown: Error | undefined
    await act(async () => {
      try {
        await result.current.generate({ problem_id: '1' })
      } catch (e) {
        thrown = e as Error
      }
    })

    expect(thrown?.message).toBe('Generation failed')
    expect(result.current.error).toBe('Generation failed')
  })
})
