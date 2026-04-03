import { render, screen, act } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/ui/Toast'

// Helper component to trigger toasts
function ToastTrigger({ message, type }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const { addToast } = useToast()
  return (
    <button onClick={() => addToast(message, type)}>
      Show Toast
    </button>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows toast message when triggered', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Hello toast" />
      </ToastProvider>,
    )
    act(() => {
      screen.getByText('Show Toast').click()
    })
    expect(screen.getByText('Hello toast')).toBeInTheDocument()
  })

  it('auto-dismisses toast after 4 seconds', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Temporary" />
      </ToastProvider>,
    )
    act(() => {
      screen.getByText('Show Toast').click()
    })
    expect(screen.getByText('Temporary')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(4100)
    })
    expect(screen.queryByText('Temporary')).not.toBeInTheDocument()
  })

  it('renders success type toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Saved!" type="success" />
      </ToastProvider>,
    )
    act(() => {
      screen.getByText('Show Toast').click()
    })
    const toast = screen.getByText('Saved!')
    expect(toast.className).toContain('bg-green-600')
  })

  it('renders error type toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Failed!" type="error" />
      </ToastProvider>,
    )
    act(() => {
      screen.getByText('Show Toast').click()
    })
    const toast = screen.getByText('Failed!')
    expect(toast.className).toContain('bg-red-600')
  })

  it('renders info type toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="FYI" type="info" />
      </ToastProvider>,
    )
    act(() => {
      screen.getByText('Show Toast').click()
    })
    const toast = screen.getByText('FYI')
    expect(toast.className).toContain('bg-chamber-800')
  })
})
