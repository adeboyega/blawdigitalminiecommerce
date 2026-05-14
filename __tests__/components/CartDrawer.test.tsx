import { render, screen, fireEvent } from '@testing-library/react'
import CartDrawer from '@/components/CartDrawer'
import type { Product } from '@/types'

jest.mock('@/components/CheckoutFlow', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="checkout-flow">
      <button onClick={onClose}>Close Checkout</button>
    </div>
  ),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

const mockCloseCart = jest.fn()
const mockUpdateQuantity = jest.fn()
const mockRemoveItem = jest.fn()
const mockClearCart = jest.fn()
const mockSubtotal = jest.fn().mockReturnValue(0)

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

const mockCartState: {
  items: { product: Product; quantity: number }[]
  isOpen: boolean
  closeCart: jest.Mock
  updateQuantity: jest.Mock
  removeItem: jest.Mock
  subtotal: jest.Mock
  clearCart: jest.Mock
} = {
  items: [],
  isOpen: true,
  closeCart: mockCloseCart,
  updateQuantity: mockUpdateQuantity,
  removeItem: mockRemoveItem,
  subtotal: mockSubtotal,
  clearCart: mockClearCart,
}

jest.mock('@/store/cartStore', () => {
  function mockUseCartStore() {
    return mockCartState
  }
  mockUseCartStore.persist = { rehydrate: jest.fn() }
  return { useCartStore: mockUseCartStore }
})

beforeEach(() => {
  jest.clearAllMocks()
  mockCartState.items = []
  mockCartState.isOpen = true
  mockSubtotal.mockReturnValue(0)
})

describe('CartDrawer — empty state', () => {
  it('shows empty cart message when there are no items', () => {
    render(<CartDrawer />)
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('does not render checkout or clear cart buttons when empty', () => {
    render(<CartDrawer />)
    expect(screen.queryByRole('button', { name: /proceed to checkout/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear cart/i })).not.toBeInTheDocument()
  })
})

describe('CartDrawer — with items', () => {
  beforeEach(() => {
    mockCartState.items = [{ product: mockProduct, quantity: 2 }]
    mockSubtotal.mockReturnValue(300000)
  })

  it('renders item product names', () => {
    render(<CartDrawer />)
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument()
  })

  it('renders the subtotal in the footer', () => {
    render(<CartDrawer />)
    // getAllByText because the line-item price (₦150,000 × 2) equals the subtotal
    expect(screen.getAllByText(/300,000/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Proceed to Checkout" button', () => {
    render(<CartDrawer />)
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument()
  })

  it('shows "Clear cart" button', () => {
    render(<CartDrawer />)
    expect(screen.getByRole('button', { name: /clear cart/i })).toBeInTheDocument()
  })

  it('calls removeItem with the product id when remove button is clicked', () => {
    render(<CartDrawer />)
    fireEvent.click(screen.getByLabelText('Remove item'))
    expect(mockRemoveItem).toHaveBeenCalledWith('prod-1')
  })

  it('calls updateQuantity with quantity + 1 when increase button is clicked', () => {
    render(<CartDrawer />)
    fireEvent.click(screen.getByLabelText('Increase quantity'))
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 3)
  })

  it('calls updateQuantity with quantity - 1 when decrease button is clicked', () => {
    render(<CartDrawer />)
    fireEvent.click(screen.getByLabelText('Decrease quantity'))
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod-1', 1)
  })

  it('calls clearCart when "Clear cart" is clicked', () => {
    render(<CartDrawer />)
    fireEvent.click(screen.getByRole('button', { name: /clear cart/i }))
    expect(mockClearCart).toHaveBeenCalled()
  })

  it('opens the checkout flow when "Proceed to Checkout" is clicked', () => {
    render(<CartDrawer />)
    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }))
    expect(mockCloseCart).toHaveBeenCalled()
    expect(screen.getByTestId('checkout-flow')).toBeInTheDocument()
  })
})

describe('CartDrawer — close', () => {
  it('calls closeCart when the X button is clicked', () => {
    render(<CartDrawer />)
    fireEvent.click(screen.getByLabelText('Close cart'))
    expect(mockCloseCart).toHaveBeenCalled()
  })
})
