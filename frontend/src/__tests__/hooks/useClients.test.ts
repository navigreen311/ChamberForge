/**
 * @jest-environment jsdom
 */

/**
 * `useClients` — reads the BFF, and fails visibly rather than looking empty.
 *
 * P-20 (T-027, T-053). This hook called `/api/v1/clients` on FastAPI, **a
 * router that has never existed** — the backend has `clients_dashboard.py`
 * and no `clients.py`. Every call 404'd. Under D4 the BFF reads Prisma
 * directly and never needs that route.
 *
 * The behaviour these tests pin down is the one that matters on a screen an
 * advisor trusts: **an unauthorised or failed read must not render as an
 * empty book.** "No clients" and "we could not load your clients" look
 * identical if the hook swallows the error and returns `[]`, and the first
 * reading is the dangerous one — an advisor who believes their book is empty
 * stops looking.
 */

import { act, renderHook, waitFor } from '@testing-library/react'

import { useClients, useClient } from '@/hooks/useClients'

const fetchMock = jest.fn()
global.fetch = fetchMock as unknown as typeof fetch

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

const CLIENT_ROW = {
  id: 'cl-sarah',
  name: 'Sarah Chen',
  company: 'Chen Family Office',
  tier: 'HNW',
  status: 'active',
  health_score: 87,
}

beforeEach(() => {
  fetchMock.mockReset()
})

describe('useClients', () => {
  test('reads the BFF route, not the FastAPI one that does not exist', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: [CLIENT_ROW], meta: { total: 1 } })
    )

    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const url = String(fetchMock.mock.calls[0][0])
    expect(url.startsWith('/api/clients')).toBe(true)
    expect(url).not.toContain('/api/v1/')
    expect(result.current.clients).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  test('passes filters through as query parameters', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [], meta: { total: 0 } }))

    const { result } = renderHook(() =>
      useClients({ status: 'active', tier: 'UHNW', q: 'chen' })
    )
    await waitFor(() => expect(result.current.loading).toBe(false))

    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('status=active')
    expect(url).toContain('tier=UHNW')
    expect(url).toContain('q=chen')
  })

  test('omits empty filters rather than sending blanks', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [], meta: { total: 0 } }))

    const { result } = renderHook(() => useClients({ status: '', q: undefined }))
    await waitFor(() => expect(result.current.loading).toBe(false))

    // `?status=` would filter on the empty string and return nothing.
    expect(String(fetchMock.mock.calls[0][0])).toBe('/api/clients')
  })

  test('a 401 renders an error state, not an empty book', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error_code: 'not_authenticated', message: 'Authentication required.' },
        401
      )
    )

    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Authentication required.')
    expect(result.current.clients).toEqual([])
  })

  test('a network failure also sets an error rather than an empty book', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))

    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch clients')
    expect(result.current.clients).toEqual([])
  })

  test('the write operations say they are not built, rather than failing vaguely', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [], meta: { total: 0 } }))

    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // No create/update/delete endpoint exists on either stack. A developer
    // should be able to tell "never built" from "the request failed".
    await act(async () => {
      await expect(result.current.createClient()).rejects.toThrow(
        /not implemented/i
      )
    })

    // And it must not have quietly issued a request to a route that is not there.
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('useClient', () => {
  test('reads the BFF detail route', async () => {
    fetchMock.mockResolvedValue(jsonResponse(CLIENT_ROW))

    const { result } = renderHook(() => useClient('cl-sarah'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      '/api/clients/cl-sarah/detail'
    )
    expect(result.current.client).toEqual(CLIENT_ROW)
  })

  test('encodes the id rather than interpolating it raw', async () => {
    fetchMock.mockResolvedValue(jsonResponse(CLIENT_ROW))

    const { result } = renderHook(() => useClient('a/b?c'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      '/api/clients/a%2Fb%3Fc/detail'
    )
  })

  test('a 404 sets an error and leaves no stale client rendered', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error_code: 'not_found', message: 'Client not found.' }, 404)
    )

    const { result } = renderHook(() => useClient('nope'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Client not found.')
    expect(result.current.client).toBeNull()
  })

  test('no id means no request at all', async () => {
    const { result } = renderHook(() => useClient(undefined))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
