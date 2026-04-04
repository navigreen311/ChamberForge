import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: () => null,
  }),
}))

// Mock useAuth
const mockLogin = jest.fn()
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    isAdmin: false,
    logout: jest.fn(),
    register: jest.fn(),
  }),
}))

// Mock useFormValidation — always passes validation
jest.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    validate: () => true,
    getError: () => undefined,
    clearErrors: jest.fn(),
    errors: {},
  }),
}))

// Mock api
const mockPost = jest.fn()
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: (...args: any[]) => mockPost(...args),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { headers: {} },
  },
}))

// Mock the UI components to simplify
jest.mock('@/components/ui/Input', () => {
  return function MockInput({
    label,
    value,
    onChange,
    type,
    placeholder,
    ...props
  }: {
    label?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string
    placeholder?: string
    required?: boolean
  }) {
    return (
      <div>
        {label && <label htmlFor={label}>{label}</label>}
        <input
          id={label}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      </div>
    )
  }
})

jest.mock('@/components/ui/Button', () => {
  return function MockButton({
    children,
    loading,
    ...props
  }: {
    children: React.ReactNode
    loading?: boolean
    type?: string
    variant?: string
    size?: string
    className?: string
  }) {
    return (
      <button disabled={loading} {...props}>
        {children}
      </button>
    )
  }
})

// Must import AFTER mocks
import LoginPage from '@/app/login/page'

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders sign-in form', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText('ChamberForge')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders register link', () => {
    render(<LoginPage />)
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('calls login on form submit', async () => {
    mockPost.mockResolvedValue({
      data: { access_token: 'tok', refresh_token: 'ref', user: { id: '1', name: 'Test' } },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })

    fireEvent.submit(screen.getByRole('heading', { name: /sign in/i }).closest('form')!)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'user@test.com',
        password: 'password123',
      })
    })
  })

  it('navigates to dashboard on success', async () => {
    mockPost.mockResolvedValue({
      data: { access_token: 'tok', refresh_token: 'ref', user: { id: '1', name: 'Test' } },
    })

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'pass' },
    })
    fireEvent.submit(screen.getByRole('heading', { name: /sign in/i }).closest('form')!)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message on login failure', async () => {
    mockPost.mockRejectedValue(new Error('Invalid credentials'))

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'bad@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    })
    fireEvent.submit(screen.getByRole('heading', { name: /sign in/i }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows fallback error for non-Error rejections', async () => {
    mockPost.mockRejectedValue('some string error')

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'bad@test.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    })
    fireEvent.submit(screen.getByRole('heading', { name: /sign in/i }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })
})
