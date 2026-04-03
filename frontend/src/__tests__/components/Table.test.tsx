import { render, screen, fireEvent } from '@testing-library/react'
import Table, { Column } from '@/components/ui/Table'

type Row = { name: string; age: number }

const columns: Column<Row>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
]

const data: Row[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
]

describe('Table', () => {
  it('renders column headers', () => {
    render(<Table columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('renders row data', () => {
    render(<Table columns={columns} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('shows empty state when no data', () => {
    render(<Table columns={columns} data={[]} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('fires onSort callback when sortable header clicked', () => {
    const onSort = jest.fn()
    render(<Table columns={columns} data={data} onSort={onSort} />)
    fireEvent.click(screen.getByText('Name'))
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
  })

  it('toggles sort direction on repeated clicks', () => {
    const onSort = jest.fn()
    render(<Table columns={columns} data={data} onSort={onSort} />)
    fireEvent.click(screen.getByText('Name'))
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
    fireEvent.click(screen.getByText('Name'))
    expect(onSort).toHaveBeenCalledWith('name', 'desc')
  })

  it('renders pagination controls', () => {
    const onPageChange = jest.fn()
    render(
      <Table
        columns={columns}
        data={data}
        pagination={{ page: 1, totalPages: 3, onPageChange }}
      />,
    )
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })

  it('calls onPageChange when next page clicked', () => {
    const onPageChange = jest.fn()
    render(
      <Table
        columns={columns}
        data={data}
        pagination={{ page: 1, totalPages: 3, onPageChange }}
      />,
    )
    // Find the next page button (second button in pagination)
    const buttons = screen.getAllByRole('button')
    const nextBtn = buttons[buttons.length - 1]
    fireEvent.click(nextBtn)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('supports custom render function for columns', () => {
    const customColumns: Column<Row>[] = [
      {
        key: 'name',
        label: 'Name',
        render: (row) => <strong data-testid="custom">{row.name}</strong>,
      },
    ]
    render(<Table columns={customColumns} data={data} />)
    const customs = screen.getAllByTestId('custom')
    expect(customs).toHaveLength(2)
    expect(customs[0]).toHaveTextContent('Alice')
  })
})
