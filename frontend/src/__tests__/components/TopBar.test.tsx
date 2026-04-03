import { render, screen, fireEvent } from '@testing-library/react'

// Mock useRealtime
jest.mock('@/hooks/useRealtime', () => ({
  useConnectionStatus: () => 'connected',
}))

// Mock useAuth for UserMenu
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Jane Doe', email: 'jane@test.com' },
    logout: jest.fn(),
    isAuthenticated: true,
    isLoading: false,
    isAdmin: false,
    login: jest.fn(),
    register: jest.fn(),
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/dashboard',
}))

import TopBar from '@/components/layout/TopBar'

describe('TopBar', () => {
  it('renders ChamberForge logo text', () => {
    render(<TopBar />)
    expect(screen.getByText('ChamberForge')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<TopBar />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders notification bell button', () => {
    render(<TopBar />)
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })

  it('renders user menu button', () => {
    render(<TopBar />)
    expect(screen.getByLabelText('User menu')).toBeInTheDocument()
  })

  it('fires onMenuToggle when hamburger clicked', () => {
    const onToggle = jest.fn()
    render(<TopBar onMenuToggle={onToggle} />)
    fireEvent.click(screen.getByLabelText('Toggle menu'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
