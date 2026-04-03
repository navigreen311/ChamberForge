import { render } from '@testing-library/react'
import {
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  PageSkeleton,
  MetricCardSkeleton,
} from '@/components/ui/LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('CardSkeleton renders without crashing', () => {
    const { container } = render(<CardSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('MetricCardSkeleton renders without crashing', () => {
    const { container } = render(<MetricCardSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('TableSkeleton renders default 5 rows', () => {
    const { container } = render(<TableSkeleton />)
    // header row + 5 data rows = 6 flex rows
    const rows = container.querySelectorAll('.flex.gap-4')
    expect(rows.length).toBe(6)
  })

  it('TableSkeleton respects count prop', () => {
    const { container } = render(<TableSkeleton count={3} />)
    // header + 3 data rows
    const rows = container.querySelectorAll('.flex.gap-4')
    expect(rows.length).toBe(4)
  })

  it('FormSkeleton renders default 4 fields', () => {
    const { container } = render(<FormSkeleton />)
    // Each field has a label pulse + input pulse; count=4 fields + 1 submit button pulse
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBe(9) // 4*2 + 1
  })

  it('FormSkeleton respects count prop', () => {
    const { container } = render(<FormSkeleton count={2} />)
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBe(5) // 2*2 + 1
  })

  it('PageSkeleton renders title, metrics, and table', () => {
    const { container } = render(<PageSkeleton />)
    // Should have multiple pulse elements
    const pulses = container.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(5)
  })
})
