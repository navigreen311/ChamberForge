import { renderHook, act } from '@testing-library/react'

// Mock the pusher module
const mockBind = jest.fn()
const mockUnbind = jest.fn()
const mockSubscribe = jest.fn(() => ({
  bind: mockBind,
  unbind: mockUnbind,
}))
const mockUnsubscribe = jest.fn()
const mockConnectionBind = jest.fn()
const mockConnectionUnbind = jest.fn()

jest.mock('@/lib/pusher', () => ({
  getPusherClient: () => ({
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    connection: {
      state: 'connected',
      bind: mockConnectionBind,
      unbind: mockConnectionUnbind,
    },
  }),
  getConnectionState: () => 'connected',
}))

import { useConnectionStatus, useChannel, useEvent } from '@/hooks/useRealtime'

describe('useConnectionStatus', () => {
  it('returns initial connection state', () => {
    const { result } = renderHook(() => useConnectionStatus())
    expect(result.current).toBe('connected')
  })

  it('binds to state_change events', () => {
    renderHook(() => useConnectionStatus())
    expect(mockConnectionBind).toHaveBeenCalledWith('state_change', expect.any(Function))
  })
})

describe('useChannel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('subscribes to the given channel', () => {
    renderHook(() => useChannel('workspace-123'))
    expect(mockSubscribe).toHaveBeenCalledWith('workspace-123')
  })

  it('returns null when channelName is null', () => {
    const { result } = renderHook(() => useChannel(null))
    expect(result.current).toBeNull()
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useChannel('test-channel'))
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalledWith('test-channel')
  })
})

describe('useEvent', () => {
  it('binds callback to event on channel', () => {
    const channel = { bind: mockBind, unbind: mockUnbind } as any
    const callback = jest.fn()
    renderHook(() => useEvent(channel, 'update', callback))
    expect(mockBind).toHaveBeenCalledWith('update', expect.any(Function))
  })

  it('does nothing when channel is null', () => {
    mockBind.mockClear()
    const callback = jest.fn()
    renderHook(() => useEvent(null, 'update', callback))
    expect(mockBind).not.toHaveBeenCalled()
  })

  it('unbinds on unmount', () => {
    const channel = { bind: mockBind, unbind: mockUnbind } as any
    const { unmount } = renderHook(() => useEvent(channel, 'update', jest.fn()))
    unmount()
    expect(mockUnbind).toHaveBeenCalledWith('update', expect.any(Function))
  })
})
