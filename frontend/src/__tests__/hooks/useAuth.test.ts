/**
 * P-11 rewrote these.
 *
 * They previously asserted that `useAuth` wrote the access token, the refresh
 * token and the user object into `localStorage` - i.e. they asserted the
 * vulnerability. On a platform holding HNW client data, any XSS on the origin
 * could read all three.
 *
 * The session now lives in an httpOnly cookie NextAuth owns, so the tests
 * that matter are the inverse: nothing sensitive is reachable from script,
 * and the hook reflects the session rather than a cache of it.
 */
import { act, renderHook } from '@testing-library/react'

import { useAuth } from '@/hooks/useAuth'

const mockUseSession = jest.fn()
const mockSignIn = jest.fn()
const mockSignOut = jest.fn()

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

jest.mock('@/lib/api', () => ({ __esModule: true, default: { post: jest.fn() } }))

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('is unauthenticated when there is no session', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('reports loading while the session resolves', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'loading' })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoading).toBe(true)
  })

  it('exposes the operator from the session', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1', email: 'a@b.com', name: 'Ivan', role: 'admin' } },
      status: 'authenticated',
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.id).toBe('u1')
    expect(result.current.isAdmin).toBe(true)
  })

  it('does not treat a plain operator as an admin', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1', role: 'operator' } },
      status: 'authenticated',
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAdmin).toBe(false)
  })

  it('signs in through NextAuth and stores NOTHING in localStorage', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    mockSignIn.mockResolvedValue({ ok: true, error: null })

    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('a@b.com', 'pw')
    })

    expect(mockSignIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({ email: 'a@b.com', redirect: false })
    )
    // The point of the whole change.
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(document.cookie).not.toContain('auth_token')
  })

  it('surfaces a failed sign-in as an error rather than a silent no-op', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

    const { result } = renderHook(() => useAuth())
    await expect(
      act(async () => {
        await result.current.login('a@b.com', 'wrong')
      })
    ).rejects.toThrow('Invalid email or password')
  })

  it('signs out through NextAuth', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1' } },
      status: 'authenticated',
    })
    mockSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.logout()
    })
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
