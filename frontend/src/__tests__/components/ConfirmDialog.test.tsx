import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const baseProps = {
  isOpen: true,
  title: 'Delete item?',
  message: 'This cannot be undone.',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
}

describe('ConfirmDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when closed', () => {
    const { container } = render(<ConfirmDialog {...baseProps} isOpen={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...baseProps} />)
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('fires onConfirm when confirm button clicked', () => {
    render(<ConfirmDialog {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('fires onCancel when cancel button clicked', () => {
    render(<ConfirmDialog {...baseProps} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('uses custom button labels', () => {
    render(<ConfirmDialog {...baseProps} confirmLabel="Yes, delete" cancelLabel="Nope" />)
    expect(screen.getByRole('button', { name: /yes, delete/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nope/i })).toBeInTheDocument()
  })

  it('fires onCancel when Escape key is pressed', () => {
    render(<ConfirmDialog {...baseProps} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders with warning variant', () => {
    render(<ConfirmDialog {...baseProps} variant="warning" />)
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
  })

  it('renders with info variant', () => {
    render(<ConfirmDialog {...baseProps} variant="info" />)
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
  })
})
