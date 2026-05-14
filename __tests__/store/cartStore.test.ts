import { useCartStore } from '@/store/cartStore'
import type { Product } from '@/types'

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product',
  description: 'A test product',
  price: 5000,
  category: 'Electronics',
  image_url: null,
  stock_qty: 10,
  created_at: '2024-01-01T00:00:00Z',
}

const mockProduct2: Product = {
  id: 'prod-2',
  name: 'Another Product',
  description: null,
  price: 3000,
  category: 'Bags',
  image_url: null,
  stock_qty: 5,
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
})

describe('cartStore — addItem', () => {
  it('adds a new product to an empty cart', () => {
    useCartStore.getState().addItem(mockProduct)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].product.id).toBe('prod-1')
    expect(items[0].quantity).toBe(1)
  })

  it('increments quantity when the same product is added again', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().addItem(mockProduct)
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it('adds a different product as a separate item', () => {
    useCartStore.getState().addItem(mockProduct)
    useCartStore.getState().addItem(mockProduct2)
    expect(useCartStore.getState().items).toHaveLength(2)
  })
})

describe('cartStore — removeItem', () => {
  it('removes an item by product id', () => {
    useCartStore.setState({ items: [{ product: mockProduct, quantity: 2 }], isOpen: false })
    useCartStore.getState().removeItem('prod-1')
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('only removes the matching item', () => {
    useCartStore.setState({
      items: [
        { product: mockProduct, quantity: 1 },
        { product: mockProduct2, quantity: 1 },
      ],
      isOpen: false,
    })
    useCartStore.getState().removeItem('prod-1')
    const { items } = useCartStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].product.id).toBe('prod-2')
  })
})

describe('cartStore — updateQuantity', () => {
  it('updates the quantity of an existing item', () => {
    useCartStore.setState({ items: [{ product: mockProduct, quantity: 1 }], isOpen: false })
    useCartStore.getState().updateQuantity('prod-1', 5)
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('removes the item when quantity is set to 0', () => {
    useCartStore.setState({ items: [{ product: mockProduct, quantity: 2 }], isOpen: false })
    useCartStore.getState().updateQuantity('prod-1', 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('removes the item when quantity is negative', () => {
    useCartStore.setState({ items: [{ product: mockProduct, quantity: 1 }], isOpen: false })
    useCartStore.getState().updateQuantity('prod-1', -1)
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('cartStore — clearCart', () => {
  it('empties all items', () => {
    useCartStore.setState({
      items: [
        { product: mockProduct, quantity: 2 },
        { product: mockProduct2, quantity: 1 },
      ],
      isOpen: false,
    })
    useCartStore.getState().clearCart()
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})

describe('cartStore — openCart / closeCart', () => {
  it('sets isOpen to true', () => {
    useCartStore.getState().openCart()
    expect(useCartStore.getState().isOpen).toBe(true)
  })

  it('sets isOpen to false', () => {
    useCartStore.setState({ items: [], isOpen: true })
    useCartStore.getState().closeCart()
    expect(useCartStore.getState().isOpen).toBe(false)
  })
})

describe('cartStore — totalItems', () => {
  it('returns 0 for empty cart', () => {
    expect(useCartStore.getState().totalItems()).toBe(0)
  })

  it('sums all item quantities', () => {
    useCartStore.setState({
      items: [
        { product: mockProduct, quantity: 3 },
        { product: mockProduct2, quantity: 2 },
      ],
      isOpen: false,
    })
    expect(useCartStore.getState().totalItems()).toBe(5)
  })
})

describe('cartStore — subtotal', () => {
  it('returns 0 for empty cart', () => {
    expect(useCartStore.getState().subtotal()).toBe(0)
  })

  it('calculates price × quantity for each item and sums them', () => {
    useCartStore.setState({
      items: [
        { product: mockProduct, quantity: 2 },  // 5000 × 2 = 10000
        { product: mockProduct2, quantity: 1 }, // 3000 × 1 = 3000
      ],
      isOpen: false,
    })
    expect(useCartStore.getState().subtotal()).toBe(13000)
  })
})
