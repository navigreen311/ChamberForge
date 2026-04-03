import { render, screen, fireEvent } from '@testing-library/react'
import Tabs from '@/components/ui/Tabs'

const tabs = [
  { id: 'tab1', label: 'First', content: <div>Content One</div> },
  { id: 'tab2', label: 'Second', content: <div>Content Two</div> },
  { id: 'tab3', label: 'Third', content: <div>Content Three</div> },
]

describe('Tabs', () => {
  it('renders all tab labels', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={jest.fn()} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('shows active tab content', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={jest.fn()} />)
    expect(screen.getByText('Content One')).toBeInTheDocument()
  })

  it('shows second tab content when active', () => {
    render(<Tabs tabs={tabs} activeTab="tab2" onChange={jest.fn()} />)
    expect(screen.getByText('Content Two')).toBeInTheDocument()
  })

  it('fires onChange when tab is clicked', () => {
    const onChange = jest.fn()
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={onChange} />)
    fireEvent.click(screen.getByText('Second'))
    expect(onChange).toHaveBeenCalledWith('tab2')
  })

  it('applies active styles to active tab', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={jest.fn()} />)
    const firstBtn = screen.getByText('First')
    expect(firstBtn.className).toContain('text-gold-400')
  })

  it('applies inactive styles to non-active tabs', () => {
    render(<Tabs tabs={tabs} activeTab="tab1" onChange={jest.fn()} />)
    const secondBtn = screen.getByText('Second')
    expect(secondBtn.className).toContain('text-chamber-400')
  })
})
