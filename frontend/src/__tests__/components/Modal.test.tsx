import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '@/components/ui/Modal'

describe('Modal', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    onClose.mockClear()
  })

  it('renders children when open', () => {
    render(
      <Modal isOpen onClose={onClose}>
        <p>Modal content</p>
      </Modal>,
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('returns null when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={onClose}>
        <p>Hidden</p>
      </Modal>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders title when provided', () => {
    render(
      <Modal isOpen onClose={onClose} title="My Modal">
        Content
      </Modal>,
    )
    expect(screen.getByText('My Modal')).toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', () => {
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>,
    )
    // The backdrop is the div with bg-black/60
    const backdrop = document.querySelector('.bg-black\\/60')
    expect(backdrop).toBeTruthy()
    fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen onClose={onClose} title="T">
        Content
      </Modal>,
    )
    // The close button has an X icon inside
    const closeBtn = document.querySelector('button.rounded-md')
    fireEvent.click(closeBtn!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sets body overflow hidden when open', () => {
    const { unmount } = render(
      <Modal isOpen onClose={onClose}>
        Content
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
