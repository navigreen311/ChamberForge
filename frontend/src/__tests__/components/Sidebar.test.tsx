import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '@/components/layout/Sidebar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

// Mock lucide-react to avoid SVG rendering issues
jest.mock('lucide-react', () => {
  const icon = ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon" />
  )
  return {
    LayoutDashboard: icon,
    Search: icon,
    CheckSquare: icon,
    Hammer: icon,
    TrendingUp: icon,
    Shield: icon,
    RefreshCw: icon,
    Settings: icon,
    ChevronDown: icon,
    ChevronRight: icon,
    PanelLeftClose: icon,
    PanelLeft: icon,
    X: icon,
  }
})

describe('Sidebar', () => {
  const onToggle = jest.fn()

  beforeEach(() => {
    onToggle.mockClear()
  })

  it('renders navigation items', () => {
    render(<Sidebar collapsed={false} onToggle={onToggle} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Discover')).toBeInTheDocument()
    expect(screen.getByText('Qualify')).toBeInTheDocument()
    expect(screen.getByText('Build')).toBeInTheDocument()
  })

  it('renders ChamberForge logo when expanded', () => {
    render(<Sidebar collapsed={false} onToggle={onToggle} />)
    expect(screen.getByText('ChamberForge')).toBeInTheDocument()
  })

  it('renders CF abbreviation when collapsed', () => {
    render(<Sidebar collapsed={true} onToggle={onToggle} />)
    expect(screen.getByText('CF')).toBeInTheDocument()
    expect(screen.queryByText('ChamberForge')).not.toBeInTheDocument()
  })

  it('hides Admin section for non-admin users', () => {
    render(<Sidebar collapsed={false} onToggle={onToggle} isAdmin={false} />)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('shows Admin section for admin users', () => {
    render(<Sidebar collapsed={false} onToggle={onToggle} isAdmin={true} />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('expands a nav group when clicked', () => {
    render(<Sidebar collapsed={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Discover'))
    expect(screen.getByText('Evidence')).toBeInTheDocument()
    expect(screen.getByText('Trends')).toBeInTheDocument()
  })

  it('collapses a nav group when clicked again', () => {
    render(<Sidebar collapsed={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Discover'))
    expect(screen.getByText('Evidence')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Discover'))
    expect(screen.queryByText('Evidence')).not.toBeInTheDocument()
  })

  it('calls onToggle when collapse button is clicked', () => {
    render(<Sidebar collapsed={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Collapse'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
