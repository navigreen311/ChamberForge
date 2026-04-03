import { render, screen } from '@testing-library/react'
import Card from '@/components/ui/Card'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card body</Card>)
    expect(screen.getByText('Card body')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<Card title="My Title">Content</Card>)
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<Card title="T" subtitle="Subtitle text">Content</Card>)
    expect(screen.getByText('Subtitle text')).toBeInTheDocument()
  })

  it('renders actions slot', () => {
    render(
      <Card title="T" actions={<button>Action</button>}>
        Content
      </Card>,
    )
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(<Card footer={<span>Footer text</span>}>Content</Card>)
    expect(screen.getByText('Footer text')).toBeInTheDocument()
  })

  it('does not render header when no title or actions', () => {
    const { container } = render(<Card>Just body</Card>)
    // No border-b header div should exist (only the body p-6 div)
    const headerDiv = container.querySelector('.border-b')
    expect(headerDiv).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="extra-class">Body</Card>)
    expect(container.firstChild).toHaveClass('extra-class')
  })
})
