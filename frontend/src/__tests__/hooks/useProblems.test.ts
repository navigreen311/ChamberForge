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

import { useProblems } from '@/hooks/useProblems'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

describe('useProblems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches problems on mount', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: [{ id: '1', title: 'P1' }] })

    const { result } = renderHook(() => useProblems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/problems', expect.anything())
    expect(result.current.problems).toHaveLength(1)
    expect(result.current.problems[0].title).toBe('P1')
  })

  it('sets error on fetch failure', async () => {
    ;(mockApi.get as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Server error' } },
    })

    const { result } = renderHook(() => useProblems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Server error')
    expect(result.current.problems).toHaveLength(0)
  })

  it('createProblem calls POST and prepends to list', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: [] })
    ;(mockApi.post as jest.Mock).mockResolvedValue({ data: { id: '2', title: 'New' } })

    const { result } = renderHook(() => useProblems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.createProblem({ title: 'New' } as any)
    })

    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/problems', { title: 'New' })
    expect(result.current.problems[0].title).toBe('New')
  })

  it('createProblem sets error on failure', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: [] })
    ;(mockApi.post as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Validation error' } },
    })

    const { result } = renderHook(() => useProblems())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let thrown: Error | undefined
    await act(async () => {
      try {
        await result.current.createProblem({ title: '' } as any)
      } catch (e) {
        thrown = e as Error
      }
    })

    expect(thrown?.message).toBe('Validation error')
    expect(result.current.error).toBe('Validation error')
  })

  it('deleteProblem calls DELETE and removes from list', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: [{ id: '1', title: 'P1' }] })
    ;(mockApi.delete as jest.Mock).mockResolvedValue({})

    const { result } = renderHook(() => useProblems())

    await waitFor(() => {
      expect(result.current.problems).toHaveLength(1)
    })

    await act(async () => {
      await result.current.deleteProblem('1')
    })

    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/problems/1')
    expect(result.current.problems).toHaveLength(0)
  })
})
