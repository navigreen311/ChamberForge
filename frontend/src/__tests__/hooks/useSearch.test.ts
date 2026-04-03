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

import { useSearch } from '@/hooks/useSearch'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

describe('useSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts with empty results', () => {
    const { result } = renderHook(() => useSearch())
    expect(result.current.results).toEqual([])
    expect(result.current.query).toBe('')
    expect(result.current.loading).toBe(false)
  })

  it('calls API with query and index', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: {
        results: [{ id: '1', title: 'Result 1', score: 0.9 }],
        total: 1,
        page: 1,
        page_size: 20,
      },
    })

    const { result } = renderHook(() => useSearch())

    await act(async () => {
      await result.current.search('tax planning', 'problems', 1)
    })

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/search', {
      params: {
        q: 'tax planning',
        index: 'problems',
        page: 1,
        page_size: 20,
      },
    })
    expect(result.current.results).toHaveLength(1)
    expect(result.current.total).toBe(1)
  })

  it('does not search with empty query', async () => {
    const { result } = renderHook(() => useSearch())

    await act(async () => {
      await result.current.search('', 'all', 1)
    })

    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it('sets error on failure', async () => {
    ;(mockApi.get as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Search timeout' } },
    })

    const { result } = renderHook(() => useSearch())

    await act(async () => {
      await result.current.search('query', 'all', 1)
    })

    expect(result.current.error).toBe('Search timeout')
  })

  it('setIndex updates the filter', () => {
    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.setIndex('clients')
    })

    expect(result.current.index).toBe('clients')
  })
})
