import { render, screen, fireEvent } from '@testing-library/react'
import NotificationBell from '@/components/layout/NotificationBell'
import type { Notification } from '@/hooks/useNotifications'

// Mock lucide-react
jest.mock('lucide-react', () => {
  const icon = ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon" />
  )
  return {
    Bell: icon,
    Info: icon,
    AlertTriangle: icon,
    AlertOctagon: icon,
    Siren: icon,
  }
})

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '5 minutes ago',
}))

const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'u1',
    workspace_id: 'w1',
    type: 'info',
    title: 'New lead assigned',
    message: 'A new lead has been assigned to you.',
    body: 'A new lead has been assigned to you.',
    action_url: '/discover/1',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'u1',
    workspace_id: 'w1',
    type: 'warning',
    title: 'Contract expiring',
    message: 'Henderson contract expires in 7 days.',
    body: 'Henderson contract expires in 7 days.',
    action_url: undefined,
    is_read: true,
    created_at: new Date().toISOString(),
  },
]

describe('NotificationBell', () => {
  const onMarkRead = jest.fn()
  const onMarkAllRead = jest.fn()
  const onNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the bell button', () => {
    render(
      <NotificationBell
        notifications={[]}
        unreadCount={0}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })

  it('shows unread count badge when count > 0', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={5}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows 99+ when unread count exceeds 99', () => {
    render(
      <NotificationBell
        notifications={[]}
        unreadCount={150}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not show badge when count is 0', () => {
    render(
      <NotificationBell
        notifications={[]}
        unreadCount={0}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('opens dropdown on click', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Notifications'))
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(screen.getByText('New lead assigned')).toBeInTheDocument()
  })

  it('closes dropdown on second click', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    fireEvent.click(screen.getByLabelText('Notifications'))
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Notifications'))
    expect(screen.queryByText('New lead assigned')).not.toBeInTheDocument()
  })

  it('shows "Mark all read" button when there are unread notifications', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    fireEvent.click(screen.getByLabelText('Notifications'))
    expect(screen.getByText('Mark all read')).toBeInTheDocument()
  })

  it('calls onMarkAllRead when mark all read clicked', () => {
    render(
      <NotificationBell
        notifications={mockNotifications}
        unreadCount={1}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    fireEvent.click(screen.getByLabelText('Notifications'))
    fireEvent.click(screen.getByText('Mark all read'))
    expect(onMarkAllRead).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no notifications', () => {
    render(
      <NotificationBell
        notifications={[]}
        unreadCount={0}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />,
    )
    fireEvent.click(screen.getByLabelText('Notifications'))
    expect(screen.getByText('No notifications yet')).toBeInTheDocument()
  })
})
