import { render, screen, fireEvent } from '@testing-library/react'
import ErrorAlert from '@/components/ui/ErrorAlert'

describe('ErrorAlert', () => {
  it('renders the error message', () => {
    render(<ErrorAlert message="Something broke" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something broke')).toBeInTheDocument()
  })

  it('renders retry button and fires callback', () => {
    const onRetry = jest.fn()
    render(<ErrorAlert message="Fail" onRetry={onRetry} />)
    const btn = screen.getByTitle('Retry')
    fireEvent.click(btn)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders dismiss button and fires callback', () => {
    const onDismiss = jest.fn()
    render(<ErrorAlert message="Fail" onDismiss={onDismiss} />)
    const btn = screen.getByTitle('Dismiss')
    fireEvent.click(btn)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorAlert message="Fail" />)
    expect(screen.queryByTitle('Retry')).not.toBeInTheDocument()
  })

  it('does not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorAlert message="Fail" />)
    expect(screen.queryByTitle('Dismiss')).not.toBeInTheDocument()
  })
})
