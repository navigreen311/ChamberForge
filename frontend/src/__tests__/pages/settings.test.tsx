import { render, screen, fireEvent } from '@testing-library/react'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/settings',
}))

import SettingsPage from '@/app/settings/page'

describe('Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders page heading', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<SettingsPage />)
    expect(screen.getByText(/manage your profile/i)).toBeInTheDocument()
  })

  it('renders all section cards', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('Usage')).toBeInTheDocument()
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
  })

  it('renders section descriptions', () => {
    render(<SettingsPage />)
    expect(screen.getByText('Name, email, password')).toBeInTheDocument()
    expect(screen.getByText('Name, slug, configuration')).toBeInTheDocument()
    expect(screen.getByText('Invite, roles, manage team')).toBeInTheDocument()
    expect(screen.getByText('Stats, AI calls, storage')).toBeInTheDocument()
    expect(screen.getByText('Delete account, export data')).toBeInTheDocument()
  })

  it('navigates to profile section on click', () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Profile').closest('button')!)
    expect(mockPush).toHaveBeenCalledWith('/settings/profile')
  })

  it('navigates to danger zone on click', () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByText('Danger Zone').closest('button')!)
    expect(mockPush).toHaveBeenCalledWith('/settings/danger')
  })
})
