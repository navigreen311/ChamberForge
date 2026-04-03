import { render, screen, fireEvent } from '@testing-library/react'
import Input from '@/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders without label', () => {
    const { container } = render(<Input placeholder="Type here" />)
    expect(container.querySelector('label')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })

  it('shows error message and applies error styles', () => {
    render(<Input label="Name" error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
    const input = screen.getByLabelText('Name')
    expect(input.className).toContain('border-red-500')
  })

  it('fires onChange handler', () => {
    const onChange = jest.fn()
    render(<Input label="Test" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Test'), { target: { value: 'hello' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter value" />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('applies normal border when no error', () => {
    render(<Input label="Field" />)
    const input = screen.getByLabelText('Field')
    expect(input.className).toContain('border-chamber-700')
  })
})
