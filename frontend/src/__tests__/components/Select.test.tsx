import { render, screen, fireEvent } from '@testing-library/react'
import Select from '@/components/ui/Select'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

describe('Select', () => {
  it('renders all options', () => {
    render(<Select options={options} />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })

  it('renders label', () => {
    render(<Select options={options} label="Category" />)
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
  })

  it('renders placeholder option', () => {
    render(<Select options={options} placeholder="Pick one" />)
    expect(screen.getByText('Pick one')).toBeInTheDocument()
  })

  it('fires onChange with selected value', () => {
    const onChange = jest.fn()
    render(<Select options={options} label="Pick" onChange={onChange} value="a" />)
    fireEvent.change(screen.getByLabelText('Pick'), { target: { value: 'b' } })
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('shows error message', () => {
    render(<Select options={options} error="Selection required" />)
    expect(screen.getByText('Selection required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Select options={options} label="Sel" error="Bad" />)
    const select = screen.getByLabelText('Sel')
    expect(select.className).toContain('border-red-500')
  })
})
