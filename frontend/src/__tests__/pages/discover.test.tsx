import { render, screen, waitFor } from '@testing-library/react'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

import DiscoverPage from '@/app/discover/page'
import api from '@/lib/api'

const mockApi = api as jest.Mocked<typeof api>

const mockProblems = [
  { id: '1', title: 'Estate Tax', category: 'Finance', lifecycle: 'Emerging', urgency: 'High', score: 85 },
  { id: '2', title: 'Yacht Crew', category: 'Marine', lifecycle: 'Growing', urgency: 'Medium', score: 72 },
]

describe('Discover Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders page heading', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: mockProblems })

    render(<DiscoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Problem Discovery')).toBeInTheDocument()
    })
  })

  it('renders search input', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: mockProblems })

    render(<DiscoverPage />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search problems/i)).toBeInTheDocument()
    })
  })

  it('renders filter labels', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: mockProblems })

    render(<DiscoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Lifecycle')).toBeInTheDocument()
      expect(screen.getByText('Urgency')).toBeInTheDocument()
    })
  })

  it('renders problem cards after loading', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: mockProblems })

    render(<DiscoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Estate Tax')).toBeInTheDocument()
      expect(screen.getByText('Yacht Crew')).toBeInTheDocument()
    })
  })

  it('renders Run AI Scan button', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: mockProblems })

    render(<DiscoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Run AI Scan')).toBeInTheDocument()
    })
  })

  it('shows empty state when no problems', async () => {
    ;(mockApi.get as jest.Mock).mockResolvedValue({ data: [] })

    render(<DiscoverPage />)

    await waitFor(() => {
      expect(screen.getByText(/no problems match/i)).toBeInTheDocument()
    })
  })
})
