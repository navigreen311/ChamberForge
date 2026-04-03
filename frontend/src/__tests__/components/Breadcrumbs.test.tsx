import { render, screen } from '@testing-library/react'

let mockPathname = '/settings/profile'
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

import Breadcrumbs from '@/components/layout/Breadcrumbs'

describe('Breadcrumbs', () => {
  it('renders breadcrumb segments from pathname', () => {
    mockPathname = '/settings/profile'
    render(<Breadcrumbs />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('first segment is a link', () => {
    mockPathname = '/settings/profile'
    render(<Breadcrumbs />)
    const link = screen.getByText('Settings').closest('a')
    expect(link).toHaveAttribute('href', '/settings')
  })

  it('last segment is not a link', () => {
    mockPathname = '/settings/profile'
    render(<Breadcrumbs />)
    const last = screen.getByText('Profile')
    expect(last.closest('a')).toBeNull()
  })

  it('returns null for single segment paths', () => {
    mockPathname = '/dashboard'
    const { container } = render(<Breadcrumbs />)
    expect(container.innerHTML).toBe('')
  })

  it('capitalizes hyphenated segments', () => {
    mockPathname = '/settings/danger-zone'
    render(<Breadcrumbs />)
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()
  })

  it('renders three segments correctly', () => {
    mockPathname = '/build/playbooks/activate'
    render(<Breadcrumbs />)
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Playbooks')).toBeInTheDocument()
    expect(screen.getByText('Activate')).toBeInTheDocument()
    // First two are links, last is not
    expect(screen.getByText('Build').closest('a')).toHaveAttribute('href', '/build')
    expect(screen.getByText('Playbooks').closest('a')).toHaveAttribute('href', '/build/playbooks')
    expect(screen.getByText('Activate').closest('a')).toBeNull()
  })
})
