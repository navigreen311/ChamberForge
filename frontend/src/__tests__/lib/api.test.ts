// Test the axios API client interceptors

describe('API client', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.resetModules()
  })

  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('access_token', 'my-token-123')

    const { default: api } = await import('@/lib/api')

    // Use a mock adapter to capture the final request config
    let capturedConfig: any
    api.defaults.adapter = async (config: any) => {
      capturedConfig = config
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }

    await api.get('/test')

    expect(capturedConfig.headers.Authorization).toBe('Bearer my-token-123')
  })

  it('does not add Authorization header when no token', async () => {
    const { default: api } = await import('@/lib/api')

    let capturedConfig: any
    api.defaults.adapter = async (config: any) => {
      capturedConfig = config
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
    }

    await api.get('/test')

    expect(capturedConfig.headers.Authorization).toBeUndefined()
  })

  it('clears token on 401 response', async () => {
    localStorage.setItem('access_token', 'tok')
    localStorage.setItem('refresh_token', 'ref')
    localStorage.setItem('user', '{}')

    const { default: api } = await import('@/lib/api')

    // Mock adapter to simulate 401
    api.defaults.adapter = async (config: any) => {
      const error = new Error('Request failed') as any
      error.response = { status: 401, data: {}, headers: {}, config }
      error.config = config
      error.isAxiosError = true
      throw error
    }

    try {
      await api.get('/protected')
    } catch {
      // Expected 401
    }

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(localStorage.getItem('refresh_token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('does not clear token on non-401 errors', async () => {
    localStorage.setItem('access_token', 'tok')

    const { default: api } = await import('@/lib/api')

    api.defaults.adapter = async (config: any) => {
      const error = new Error('Server error') as any
      error.response = { status: 500, data: {}, headers: {}, config }
      error.config = config
      error.isAxiosError = true
      throw error
    }

    try {
      await api.get('/test')
    } catch {
      // Expected
    }

    expect(localStorage.getItem('access_token')).toBe('tok')
  })

  it('sets correct base URL and timeout', async () => {
    const { default: api } = await import('@/lib/api')
    expect(api.defaults.baseURL).toBe('http://localhost:8000')
    expect(api.defaults.timeout).toBe(30_000)
  })

  it('sets Content-Type to application/json', async () => {
    const { default: api } = await import('@/lib/api')
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })
})
