import { render, screen, act } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows skeleton loading state initially', () => {
    const { container } = render(<DashboardPage />)
    expect(screen.queryByText('Command Dashboard')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders dashboard sections after loading', () => {
    render(<DashboardPage />)
    act(() => { jest.advanceTimersByTime(900) })
    expect(screen.getByText('Command Dashboard')).toBeInTheDocument()
  })

  it('renders metrics section', () => {
    render(<DashboardPage />)
    act(() => { jest.advanceTimersByTime(900) })
    expect(screen.getByText('Active Problems')).toBeInTheDocument()
    expect(screen.getByText('Qualified Leads')).toBeInTheDocument()
    expect(screen.getByText('Pipeline Value')).toBeInTheDocument()
    expect(screen.getByText('Client Health')).toBeInTheDocument()
  })

  it('renders AI Agent Status section', () => {
    render(<DashboardPage />)
    act(() => { jest.advanceTimersByTime(900) })
    expect(screen.getByText('AI Agent Status')).toBeInTheDocument()
    expect(screen.getByText('Scout')).toBeInTheDocument()
    expect(screen.getByText('Analyst')).toBeInTheDocument()
    expect(screen.getByText('Strategist')).toBeInTheDocument()
  })

  it('renders next recommended action', () => {
    render(<DashboardPage />)
    act(() => { jest.advanceTimersByTime(900) })
    expect(screen.getByText('Next Recommended Action')).toBeInTheDocument()
    const matches = screen.getAllByText(/Private Aviation Concierge/)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders daily brief section', () => {
    render(<DashboardPage />)
    act(() => { jest.advanceTimersByTime(900) })
    expect(screen.getByText('Daily Brief')).toBeInTheDocument()
    expect(screen.getByText('Market Signal')).toBeInTheDocument()
    expect(screen.getByText('Client Alert')).toBeInTheDocument()
  })

  it('renders opportunities table', () => {
    render(<DashboardPage />)
    act(() => { jest.advanceTimersByTime(900) })
    expect(screen.getByText('Active Opportunities')).toBeInTheDocument()
    expect(screen.getByText('Estate Management Platform')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<DashboardPage />)
    act(() => { jest.advanceTimersByTime(900) })
    expect(screen.getByText('Take Action')).toBeInTheDocument()
    expect(screen.getByText('Snooze')).toBeInTheDocument()
    expect(screen.getByText('Dismiss')).toBeInTheDocument()
  })
})
