import { render, screen, waitFor } from '@testing-library/react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/dashboard',
}))

// Mock realtime hooks
jest.mock('@/hooks/useRealtime', () => ({
  useWorkspaceEvents: () => null,
  useEvent: jest.fn(),
}))

// Mock api
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

import DashboardPage from '@/app/dashboard/page'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

const dashboardData = {
  metrics: [
    { label: 'Active Problems', value: 42, change: '+5', up: true },
    { label: 'Qualified Leads', value: 18, change: '+3', up: true },
    { label: 'Pipeline Value', value: '$2.4M', change: '+12%', up: true },
    { label: 'Client Health', value: '94%', change: '-1%', up: false },
  ],
}

const nextActionData = {
  action_title: 'Review Private Aviation Concierge proposal',
  action_description: 'A new high-value problem has been identified.',
  why: 'High urgency signal detected.',
  evidence_links: [],
  confidence: 0.87,
  priority: 'high',
  estimated_impact: '$500K ARR',
}

const agentStatusData = {
  statuses: {
    Scout: 'active',
    Analyst: 'active',
    Strategist: 'idle',
  },
  details: {
    Scout: { status: 'active', last_output: 'Scanning market reports' },
    Analyst: { status: 'active', last_output: 'Analyzing client data' },
    Strategist: { status: 'idle', last_output: '' },
  },
}

const dailyBriefData = {
  date: '2026-04-03',
  changes_since_yesterday: ['New market signal detected'],
  alerts: ['Client churn risk increased'],
  recommended_actions: [{ action: 'Review portfolio', priority: 'high', reason: 'Market shift' }],
  metrics_snapshot: {},
}

const opportunitiesData = {
  opportunities: [
    {
      problem_id: '1',
      problem_name: 'Estate Management Platform',
      offer_name: 'Full Suite',
      probability: 0.8,
      impact_score: 8.5,
      weighted_score: 6.8,
      recommended_action: 'Propose',
    },
  ],
}

function setupMocks() {
  ;(mockApi.get as jest.Mock).mockImplementation((url: string) => {
    if (url.includes('next-action')) return Promise.resolve({ data: nextActionData })
    if (url.includes('dashboard')) return Promise.resolve({ data: dashboardData })
    if (url.includes('opportunities')) return Promise.resolve({ data: opportunitiesData })
    if (url.includes('daily-brief')) return Promise.resolve({ data: dailyBriefData })
    if (url.includes('agent-status')) return Promise.resolve({ data: agentStatusData })
    return Promise.resolve({ data: {} })
  })
}

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('shows loading state initially and then renders content', async () => {
    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Command Dashboard')).toBeInTheDocument()
    })
  })

  it('renders dashboard sections after loading', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('Command Dashboard')).toBeInTheDocument()
    })
  })

  it('renders metrics section', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('Active Problems')).toBeInTheDocument()
      expect(screen.getByText('Qualified Leads')).toBeInTheDocument()
      expect(screen.getByText('Pipeline Value')).toBeInTheDocument()
      expect(screen.getByText('Client Health')).toBeInTheDocument()
    })
  })

  it('renders AI Agent Status section', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('AI Agent Status')).toBeInTheDocument()
      expect(screen.getByText('Scout')).toBeInTheDocument()
      expect(screen.getByText('Analyst')).toBeInTheDocument()
      expect(screen.getByText('Strategist')).toBeInTheDocument()
    })
  })

  it('renders next recommended action', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      const matches = screen.getAllByText(/Private Aviation Concierge/)
      expect(matches.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders daily brief section', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText(/Daily Brief/)).toBeInTheDocument()
    })
  })

  it('renders opportunities table', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('Opportunity Ranker')).toBeInTheDocument()
      expect(screen.getByText('Estate Management Platform')).toBeInTheDocument()
    })
  })

  it('renders action buttons', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(screen.getByText('Execute')).toBeInTheDocument()
      expect(screen.getByText('Dismiss')).toBeInTheDocument()
    })
  })
})
