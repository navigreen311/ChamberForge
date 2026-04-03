import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockRegister = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    isAdmin: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))

jest.mock('@/hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    validate: () => true,
    getError: () => undefined,
    clearErrors: jest.fn(),
  }),
}))

jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

import RegisterPage from '@/app/register/page'

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the registration form', () => {
    render(<RegisterPage />)
    expect(screen.getByText(/create your chamberforge account/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Workspace Name')).toBeInTheDocument()
  })

  it('renders sign-in link', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('calls register on form submit', async () => {
    mockRegister.mockResolvedValue({})
    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Workspace Name'), { target: { value: 'Acme' } })

    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@test.com',
        password: 'password123',
        workspace_name: 'Acme',
      })
    })
  })

  it('shows error on registration failure', async () => {
    mockRegister.mockRejectedValue({
      response: { data: { detail: 'Email already exists' } },
    })

    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Jane' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane@test.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass12345' } })
    fireEvent.change(screen.getByLabelText('Workspace Name'), { target: { value: 'Corp' } })

    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('disables button while submitting', async () => {
    let resolveRegister: () => void
    mockRegister.mockImplementation(
      () => new Promise<void>((r) => { resolveRegister = r }),
    )

    render(<RegisterPage />)

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 't@t.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '12345678' } })
    fireEvent.change(screen.getByLabelText('Workspace Name'), { target: { value: 'WS' } })

    fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
    })

    // Resolve so the hook cleans up
    resolveRegister!()
  })
})
