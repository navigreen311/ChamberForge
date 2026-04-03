import { render, screen, fireEvent } from '@testing-library/react'

const mockLogout = jest.fn()
const mockPush = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'John Smith', email: 'john@example.com' },
    logout: mockLogout,
    isAuthenticated: true,
    isLoading: false,
    isAdmin: false,
    login: jest.fn(),
    register: jest.fn(),
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

import UserMenu from '@/components/layout/UserMenu'

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows initials on avatar button', () => {
    render(<UserMenu />)
    expect(screen.getByLabelText('User menu')).toHaveTextContent('JS')
  })

  it('dropdown is closed by default', () => {
    render(<UserMenu />)
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
  })

  it('opens dropdown on click', () => {
    render(<UserMenu />)
    fireEvent.click(screen.getByLabelText('User menu'))
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('shows user name and email in dropdown', () => {
    render(<UserMenu />)
    fireEvent.click(screen.getByLabelText('User menu'))
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('fires logout when Logout clicked', () => {
    render(<UserMenu />)
    fireEvent.click(screen.getByLabelText('User menu'))
    fireEvent.click(screen.getByText('Logout'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('navigates to settings when Settings clicked', () => {
    render(<UserMenu />)
    fireEvent.click(screen.getByLabelText('User menu'))
    fireEvent.click(screen.getByText('Settings'))
    expect(mockPush).toHaveBeenCalledWith('/settings')
  })
})
