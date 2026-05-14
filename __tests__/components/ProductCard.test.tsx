import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

const mockAddItem = jest.fn()
const mockOpenCart = jest.fn()
const mockToggle = jest.fn()
const mockHas = jest.fn().mockReturnValue(false)

jest.mock('@/store/cartStore', () => ({
  useCartStore: (selector: (s: any) => any) =>
    selector({ addItem: mockAddItem, openCart: mockOpenCart }),
}))

jest.mock('@/store/wishlistStore', () => {
  function mockUseWishlistStore() {
    return { toggle: mockToggle, has: mockHas }
  }
  mockUseWishlistStore.persist = { rehydrate: jest.fn() }
  return { useWishlistStore: mockUseWishlistStore }
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Samsung Galaxy',
  description: 'Great phone',
  price: 150000,
  category: 'Electronics',
  image_url: null,
  stock_qty: 5,
  created_at: '2024-01-01T00:00:00Z',
}

const outOfStockProduct: Product = {
  ...mockProduct,
  id: 'prod-2',
  name: 'Sold Out Item',
  stock_qty: 0,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockHas.mockReturnValue(false)
})

describe('ProductCard — rendering', () => {
  it('renders the product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument()
  })

  it('renders the formatted price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/₦150,000/)).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Great phone')).toBeInTheDocument()
  })

  it('links to the product detail page', () => {
    render(<ProductCard product={mockProduct} />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/product/prod-1')
  })
})

describe('ProductCard — out of stock', () => {
  it('shows "Out of stock" overlay when stock_qty is 0', () => {
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('disables the "Add to cart" button when out of stock', () => {
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled()
  })

  it('enables the "Add to cart" button when in stock', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled()
  })
})

describe('ProductCard — add to cart', () => {
  it('calls addItem and openCart when the button is clicked', () => {
    render(<ProductCard product={mockProduct} />)
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct)
    expect(mockOpenCart).toHaveBeenCalled()
  })

  it('does not call addItem when product is out of stock', () => {
    render(<ProductCard product={outOfStockProduct} />)
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(mockAddItem).not.toHaveBeenCalled()
  })
})

describe('ProductCard — wishlist', () => {
  it('shows "Add to wishlist" label when not wishlisted', () => {
    mockHas.mockReturnValue(false)
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByLabelText(/add to wishlist/i)).toBeInTheDocument()
  })

  it('shows "Remove from wishlist" label when wishlisted', () => {
    mockHas.mockReturnValue(true)
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByLabelText(/remove from wishlist/i)).toBeInTheDocument()
  })

  it('calls toggle with the product when wishlist button is clicked', () => {
    render(<ProductCard product={mockProduct} />)
    fireEvent.click(screen.getByLabelText(/wishlist/i))
    expect(mockToggle).toHaveBeenCalledWith(mockProduct)
  })
})
