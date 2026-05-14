import { useWishlistStore } from '@/store/wishlistStore'
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
  useWishlistStore.setState({ items: [] })
})

describe('wishlistStore — add', () => {
  it('adds a product to an empty wishlist', () => {
    useWishlistStore.getState().add(mockProduct)
    expect(useWishlistStore.getState().items).toHaveLength(1)
  })

  it('adds multiple different products', () => {
    useWishlistStore.getState().add(mockProduct)
    useWishlistStore.getState().add(mockProduct2)
    expect(useWishlistStore.getState().items).toHaveLength(2)
  })
})

describe('wishlistStore — remove', () => {
  it('removes a product by id', () => {
    useWishlistStore.setState({ items: [mockProduct, mockProduct2] })
    useWishlistStore.getState().remove('prod-1')
    const { items } = useWishlistStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('prod-2')
  })
})

describe('wishlistStore — toggle', () => {
  it('adds a product when it is not in the wishlist', () => {
    useWishlistStore.getState().toggle(mockProduct)
    expect(useWishlistStore.getState().items).toHaveLength(1)
  })

  it('removes a product when it is already in the wishlist', () => {
    useWishlistStore.setState({ items: [mockProduct] })
    useWishlistStore.getState().toggle(mockProduct)
    expect(useWishlistStore.getState().items).toHaveLength(0)
  })
})

describe('wishlistStore — has', () => {
  it('returns false when product is not in wishlist', () => {
    expect(useWishlistStore.getState().has('prod-1')).toBe(false)
  })

  it('returns true when product is in wishlist', () => {
    useWishlistStore.setState({ items: [mockProduct] })
    expect(useWishlistStore.getState().has('prod-1')).toBe(true)
  })
})

describe('wishlistStore — count', () => {
  it('returns 0 for empty wishlist', () => {
    expect(useWishlistStore.getState().count()).toBe(0)
  })

  it('returns the correct count', () => {
    useWishlistStore.setState({ items: [mockProduct, mockProduct2] })
    expect(useWishlistStore.getState().count()).toBe(2)
  })
})
