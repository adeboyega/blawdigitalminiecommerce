import {
  createOrder, fetchOrder, fetchAllOrders,
  updateOrderStatus, getProfile, upsertProfile,
  type Order,
} from '@/services/orders'
import { supabase } from '@/services/supabase'

jest.mock('@/services/supabase', () => ({
  supabase: { from: jest.fn() },
}))

const mockSupabase = supabase as { from: jest.Mock }

const mockOrder: Order = {
  id: 'order-1',
  user_id: 'user-1',
  items: [{ id: 'prod-1', name: 'Test', price: 5000, quantity: 2, image_url: null }],
  subtotal: 10000,
  name: 'Bayomi Aremo',
  phone: '08012345678',
  email: 'test@example.com',
  address: '5 Broad Street',
  city: 'Lagos Island',
  state: 'Lagos',
  payment_method: 'card',
  payment_ref: 'PSK-123',
  status: 'placed',
  placed_at: '2024-01-01T10:00:00Z',
  confirmed_at: null,
  out_for_delivery_at: null,
  delivered_at: null,
  created_at: '2024-01-01T10:00:00Z',
}

beforeEach(() => jest.clearAllMocks())

describe('fetchOrder', () => {
  it('returns order data when found', async () => {
    const single = jest.fn().mockResolvedValue({ data: mockOrder, error: null })
    const eq = jest.fn().mockReturnValue({ single })
    const select = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await fetchOrder('order-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('orders')
    expect(result).toEqual(mockOrder)
  })

  it('returns null when order is not found', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const eq = jest.fn().mockReturnValue({ single })
    const select = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await fetchOrder('nonexistent')
    expect(result).toBeNull()
  })
})

describe('fetchAllOrders', () => {
  it('returns an array of orders ordered by created_at descending', async () => {
    const order = jest.fn().mockResolvedValue({ data: [mockOrder], error: null })
    const select = jest.fn().mockReturnValue({ order })
    mockSupabase.from.mockReturnValue({ select })

    const result = await fetchAllOrders()

    expect(mockSupabase.from).toHaveBeenCalledWith('orders')
    expect(result).toEqual([mockOrder])
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('returns an empty array when no orders exist', async () => {
    const order = jest.fn().mockResolvedValue({ data: null, error: null })
    const select = jest.fn().mockReturnValue({ order })
    mockSupabase.from.mockReturnValue({ select })

    const result = await fetchAllOrders()
    expect(result).toEqual([])
  })
})

describe('createOrder', () => {
  it('inserts order and returns the created record', async () => {
    const single = jest.fn().mockResolvedValue({ data: mockOrder, error: null })
    const select = jest.fn().mockReturnValue({ single })
    const insert = jest.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    const { id, created_at, ...orderData } = mockOrder
    const result = await createOrder(orderData)

    expect(mockSupabase.from).toHaveBeenCalledWith('orders')
    expect(result).toEqual(mockOrder)
  })

  it('returns null on insert error', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const select = jest.fn().mockReturnValue({ single })
    const insert = jest.fn().mockReturnValue({ select })
    mockSupabase.from.mockReturnValue({ insert })

    const { id, created_at, ...orderData } = mockOrder
    const result = await createOrder(orderData)
    expect(result).toBeNull()
  })
})

describe('updateOrderStatus', () => {
  it('updates status to "confirmed" and sets confirmed_at timestamp', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null })
    const update = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await updateOrderStatus('order-1', 'confirmed')

    expect(mockSupabase.from).toHaveBeenCalledWith('orders')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'confirmed', confirmed_at: expect.any(String) })
    )
    expect(eq).toHaveBeenCalledWith('id', 'order-1')
  })

  it('updates status to "out_for_delivery" and sets out_for_delivery_at timestamp', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null })
    const update = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await updateOrderStatus('order-1', 'out_for_delivery')

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'out_for_delivery', out_for_delivery_at: expect.any(String) })
    )
  })

  it('updates "placed" status without a timestamp field', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null })
    const update = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await updateOrderStatus('order-1', 'placed')

    expect(update).toHaveBeenCalledWith({ status: 'placed' })
  })

  it('updates status to "delivered" and sets delivered_at timestamp', async () => {
    const eq = jest.fn().mockResolvedValue({ error: null })
    const update = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ update })

    await updateOrderStatus('order-1', 'delivered')

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'delivered', delivered_at: expect.any(String) })
    )
  })
})

describe('getProfile', () => {
  it('returns profile data for a given user id', async () => {
    const mockProfile = { id: 'user-1', name: 'Bayomi', email: 'test@example.com', phone: null, address: null, city: null, state: null }
    const single = jest.fn().mockResolvedValue({ data: mockProfile, error: null })
    const eq = jest.fn().mockReturnValue({ single })
    const select = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await getProfile('user-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(result).toEqual(mockProfile)
  })

  it('returns null when profile is not found', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: null })
    const eq = jest.fn().mockReturnValue({ single })
    const select = jest.fn().mockReturnValue({ eq })
    mockSupabase.from.mockReturnValue({ select })

    const result = await getProfile('unknown')
    expect(result).toBeNull()
  })
})

describe('upsertProfile', () => {
  it('calls upsert with profile data and updated_at', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null })
    mockSupabase.from.mockReturnValue({ upsert })

    await upsertProfile({ id: 'user-1', name: 'Bayomi' })

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', name: 'Bayomi', updated_at: expect.any(String) })
    )
  })
})
