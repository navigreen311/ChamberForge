import { render, screen, fireEvent } from '@testing-library/react'
import EmptyState, {
  NoProblems,
  NoOffers,
  NoClients,
  NoEvidence,
  NoResults,
} from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<EmptyState title="Test" icon={<svg data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Test" description="Some details" />)
    expect(screen.getByText('Some details')).toBeInTheDocument()
  })

  it('renders action button and fires callback', () => {
    const onAction = jest.fn()
    render(<EmptyState title="Test" actionLabel="Do it" onAction={onAction} />)
    const btn = screen.getByRole('button', { name: /do it/i })
    fireEvent.click(btn)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('does not render button without both actionLabel and onAction', () => {
    render(<EmptyState title="Test" actionLabel="Click" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('NoProblems preset renders', () => {
    render(<NoProblems />)
    expect(screen.getByText('No problems yet')).toBeInTheDocument()
  })

  it('NoOffers preset renders', () => {
    render(<NoOffers />)
    expect(screen.getByText('No offers yet')).toBeInTheDocument()
  })

  it('NoClients preset renders', () => {
    render(<NoClients />)
    expect(screen.getByText('No clients yet')).toBeInTheDocument()
  })

  it('NoEvidence preset renders', () => {
    render(<NoEvidence />)
    expect(screen.getByText('No evidence yet')).toBeInTheDocument()
  })

  it('NoResults preset renders', () => {
    render(<NoResults />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })
})
