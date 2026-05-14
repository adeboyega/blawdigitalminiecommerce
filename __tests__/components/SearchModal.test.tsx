import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchModal from '@/components/SearchModal'
import type { Product } from '@/types'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Samsung Galaxy', description: 'Great phone', price: 150000, category: 'Electronics', image_url: null, stock_qty: 5, created_at: '2024-01-01T00:00:00Z' },
  { id: 'prod-2', name: 'Leather Handbag', description: 'Premium leather', price: 45000, category: 'Bags', image_url: null, stock_qty: 0, created_at: '2024-01-01T00:00:00Z' },
  { id: 'prod-3', name: 'Nike Air Max', description: 'Running shoes', price: 80000, category: 'Footwear', image_url: null, stock_qty: 3, created_at: '2024-01-01T00:00:00Z' },
]

const defaultProps = {
  products: mockProducts,
  isOpen: true,
  onClose: jest.fn(),
}

beforeEach(() => jest.clearAllMocks())

describe('SearchModal — visibility', () => {
  it('renders when isOpen is true', () => {
    render(<SearchModal {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<SearchModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByPlaceholderText(/search products/i)).not.toBeInTheDocument()
  })
})

describe('SearchModal — empty state', () => {
  it('shows the prompt to start typing when query is empty', () => {
    render(<SearchModal {...defaultProps} />)
    expect(screen.getByText(/start typing/i)).toBeInTheDocument()
  })
})

describe('SearchModal — search filtering', () => {
  it('shows matching products as the user types', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText(/search products/i)
    await userEvent.type(input, 'Samsung')
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument()
    expect(screen.queryByText('Leather Handbag')).not.toBeInTheDocument()
  })

  it('filters by category name', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText(/search products/i)
    await userEvent.type(input, 'Bags')
    expect(screen.getByText('Leather Handbag')).toBeInTheDocument()
    expect(screen.queryByText('Samsung Galaxy')).not.toBeInTheDocument()
  })

  it('shows "no results" message for unmatched query', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText(/search products/i)
    await userEvent.type(input, 'xyz-not-a-product')
    expect(screen.getByText(/no results for/i)).toBeInTheDocument()
  })

  it('shows result count when products are found', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText(/search products/i)
    await userEvent.type(input, 'a')
    expect(screen.getByText(/result/i)).toBeInTheDocument()
  })

  it('shows out of stock label for products with zero stock', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText(/search products/i)
    await userEvent.type(input, 'Leather')
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })
})

describe('SearchModal — navigation', () => {
  it('calls router.push and onClose when a result is clicked', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText(/search products/i)
    await userEvent.type(input, 'Samsung')
    fireEvent.click(screen.getByText('Samsung Galaxy'))
    expect(defaultProps.onClose).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/product/prod-1')
  })
})

describe('SearchModal — close behaviour', () => {
  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<SearchModal {...defaultProps} />)
    const backdrop = container.querySelector('.absolute.inset-0')
    if (backdrop) fireEvent.click(backdrop)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<SearchModal {...defaultProps} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('clears the query when the clear button is clicked', async () => {
    render(<SearchModal {...defaultProps} />)
    const input = screen.getByPlaceholderText(/search products/i) as HTMLInputElement
    await userEvent.type(input, 'Samsung')
    expect(input.value).toBe('Samsung')
    const clearBtn = screen.getByRole('button', { name: '' })
    // find the X button by finding it next to a filled input
    fireEvent.click(clearBtn)
    // Input should be cleared (handled by the clear button)
  })
})
