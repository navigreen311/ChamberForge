/**
 * The axios client's interceptors.
 *
 * P-11 rewrote the auth assertions. They previously checked that the client
 * read an access token out of `localStorage` and set an `Authorization`
 * header from it, and that a 401 cleared three localStorage keys - i.e. they
 * asserted the vulnerability.
 *
 * The session is now an httpOnly cookie the server owns. The client sends it
 * via `withCredentials` and never sees it, so what these tests protect is the
 * absence: no token is read, none is attached, and a 401 has nothing to
 * clear.
 *
 * The request-id and error-envelope behaviour is unchanged and still covered.
 */

type MockConfig = Record<string, unknown> & { headers: Record<string, unknown> }

describe('API client', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.resetModules()
  })

  it('sends credentials so the httpOnly session cookie travels', async () => {
    const { default: api } = await import('@/lib/api')
    expect(api.defaults.withCredentials).toBe(true)
  })

  it('does NOT read a token from localStorage', async () => {
    // Even if something else left one there, the client must ignore it -
    // reading it back would recreate the exposure this change removed.
    localStorage.setItem('access_token', 'stale-token-from-an-old-session')

    const { default: api } = await import('@/lib/api')

    let captured: MockConfig | undefined
    api.defaults.adapter = async (config: unknown) => {
      captured = config as MockConfig
      return {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as never,
      }
    }

    await api.get('/test')
    expect(captured?.headers.Authorization).toBeUndefined()
  })

  it('attaches a request id to every request', async () => {
    const { default: api } = await import('@/lib/api')

    let captured: MockConfig | undefined
    api.defaults.adapter = async (config: unknown) => {
      captured = config as MockConfig
      return {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as never,
      }
    }

    await api.get('/test')
    expect(captured?.headers['X-Request-ID']).toEqual(expect.any(String))
  })

  it('parses the standardized error envelope', async () => {
    const { default: api } = await import('@/lib/api')

    api.defaults.adapter = async (config: unknown) => {
      const error = new Error('Request failed') as Error & Record<string, unknown>
      error.response = {
        status: 422,
        data: {
          error_code: 'validation_failed',
          message: 'Name is required.',
          details: { field_errors: { name: 'required' } },
        },
        headers: {},
        config,
      }
      error.config = config
      error.isAxiosError = true
      throw error
    }

    await expect(api.get('/test')).rejects.toMatchObject({
      errorCode: 'validation_failed',
      userMessage: 'Name is required.',
      fieldErrors: { name: 'required' },
    })
  })

  it('leaves storage alone on a 401 - there is nothing client-side to clear', async () => {
    localStorage.setItem('unrelated', 'keep-me')

    const { default: api } = await import('@/lib/api')

    api.defaults.adapter = async (config: unknown) => {
      const error = new Error('Unauthorized') as Error & Record<string, unknown>
      error.response = { status: 401, data: {}, headers: {}, config }
      error.config = config
      error.isAxiosError = true
      throw error
    }

    try {
      await api.get('/protected')
    } catch {
      // expected
    }

    expect(localStorage.getItem('unrelated')).toBe('keep-me')
  })

  it('sets Content-Type to application/json', async () => {
    const { default: api } = await import('@/lib/api')
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })
})
