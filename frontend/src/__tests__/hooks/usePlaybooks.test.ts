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

import { usePlaybooks, useActivatePlaybook } from '@/hooks/usePlaybooks'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

describe('usePlaybooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches playbooks on mount', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: [{ slug: 'pb1', name: 'Playbook 1' }],
    })

    const { result } = renderHook(() => usePlaybooks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/playbooks')
    expect(result.current.playbooks).toHaveLength(1)
  })

  it('sets error on failure', async () => {
    ;(mockApi.get as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Not found' } },
    })

    const { result } = renderHook(() => usePlaybooks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Not found')
  })

  it('handles paginated items response', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({
      data: { items: [{ slug: 'a' }, { slug: 'b' }] },
    })

    const { result } = renderHook(() => usePlaybooks())

    await waitFor(() => {
      expect(result.current.playbooks).toHaveLength(2)
    })
  })
})

describe('useActivatePlaybook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls POST to activate playbook', async () => {
    ;(mockApi.post as jest.Mock).mockResolvedValue({
      data: { slug: 'pb1', is_active: true },
    })

    const { result } = renderHook(() => useActivatePlaybook())

    await act(async () => {
      const pb = await result.current.activate('pb1')
      expect(pb.slug).toBe('pb1')
    })

    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/playbooks/pb1/activate')
  })

  it('sets error on activation failure', async () => {
    ;(mockApi.post as jest.Mock).mockRejectedValue({
      response: { data: { detail: 'Already active' } },
    })

    const { result } = renderHook(() => useActivatePlaybook())

    let thrown: Error | undefined
    await act(async () => {
      try {
        await result.current.activate('pb1')
      } catch (e) {
        thrown = e as Error
      }
    })

    expect(thrown?.message).toBe('Already active')
    expect(result.current.error).toBe('Already active')
  })
})
