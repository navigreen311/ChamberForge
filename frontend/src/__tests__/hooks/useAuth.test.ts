import { renderHook, act } from '@testing-library/react'

// Mock the api module
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('starts with isAuthenticated false when no token', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('hydrates from localStorage if token and user exist', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test',
      role: 'admin',
      workspace_id: 'w1',
      created_at: '',
      updated_at: '',
    }
    localStorage.setItem('access_token', 'tok123')
    localStorage.setItem('user', JSON.stringify(mockUser))

    const { result } = renderHook(() => useAuth())

    await act(async () => {})

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('test@test.com')
    expect(result.current.isAdmin).toBe(true)
  })

  it('login sets token and user in localStorage', async () => {
    const mockUser = {
      id: '2',
      email: 'user@co.com',
      name: 'User',
      role: 'advisor',
      workspace_id: 'w1',
      created_at: '',
      updated_at: '',
    }
    ;(mockApi.post as jest.Mock).mockResolvedValue({
      data: {
        access_token: 'abc',
        refresh_token: 'xyz',
        token_type: 'bearer',
        expires_in: 3600,
        user: mockUser,
      },
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.login('user@co.com', 'pass')
    })

    expect(localStorage.getItem('access_token')).toBe('abc')
    expect(localStorage.getItem('refresh_token')).toBe('xyz')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('user@co.com')
    expect(result.current.isAdmin).toBe(false)
  })

  it('logout clears state and localStorage', async () => {
    localStorage.setItem('access_token', 'tok')
    localStorage.setItem('refresh_token', 'ref')
    localStorage.setItem('user', '{}')

    const { result } = renderHook(() => useAuth())

    // logout() sets window.location.href which triggers jsdom navigation
    // We catch the error since jsdom can't actually navigate
    try {
      act(() => {
        result.current.logout()
      })
    } catch {
      // jsdom navigation error is expected
    }

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('isAuthenticated reflects token presence after login/logout cycle', async () => {
    ;(mockApi.post as jest.Mock).mockResolvedValue({
      data: {
        access_token: 'tok',
        refresh_token: 'ref',
        token_type: 'bearer',
        expires_in: 3600,
        user: { id: '1', email: 'a@b.com', name: 'A', role: 'viewer', workspace_id: 'w', created_at: '', updated_at: '' },
      },
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAuthenticated).toBe(false)

    await act(async () => {
      await result.current.login('a@b.com', 'pass')
    })
    expect(result.current.isAuthenticated).toBe(true)

    try {
      act(() => {
        result.current.logout()
      })
    } catch {
      // jsdom navigation error
    }
    expect(result.current.isAuthenticated).toBe(false)
  })
})
