import { render, screen } from '@testing-library/react'
import Badge from '@/components/ui/Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>)
    const el = screen.getByText('Default')
    expect(el.className).toContain('bg-chamber-700')
    expect(el.className).toContain('text-chamber-200')
  })

  it('applies success variant styles', () => {
    render(<Badge variant="success">OK</Badge>)
    const el = screen.getByText('OK')
    expect(el.className).toContain('bg-green-900/60')
    expect(el.className).toContain('text-green-300')
  })

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warn</Badge>)
    const el = screen.getByText('Warn')
    expect(el.className).toContain('bg-yellow-900/60')
  })

  it('applies danger variant styles', () => {
    render(<Badge variant="danger">Error</Badge>)
    const el = screen.getByText('Error')
    expect(el.className).toContain('bg-red-900/60')
  })

  it('applies info variant styles', () => {
    render(<Badge variant="info">Info</Badge>)
    const el = screen.getByText('Info')
    expect(el.className).toContain('bg-blue-900/60')
  })

  it('applies gold variant styles', () => {
    render(<Badge variant="gold">Premium</Badge>)
    const el = screen.getByText('Premium')
    expect(el.className).toContain('bg-gold-400/20')
    expect(el.className).toContain('text-gold-400')
  })

  it('merges custom className', () => {
    render(<Badge className="mt-4">Custom</Badge>)
    const el = screen.getByText('Custom')
    expect(el.className).toContain('mt-4')
    // Still has base classes
    expect(el.className).toContain('rounded-full')
  })
})
