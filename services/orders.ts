import { supabase } from "@/services/supabase";

export type OrderStatus = "placed" | "confirmed" | "out_for_delivery" | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  subtotal: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  payment_method: string;
  payment_ref: string | null;
  status: OrderStatus;
  placed_at: string;
  confirmed_at: string | null;
  out_for_delivery_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

export async function createOrder(
  data: Omit<Order, "id" | "created_at">
): Promise<Order | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .insert(data)
    .select()
    .single();
  if (error) { console.error("createOrder:", error.message); return null; }
  return order;
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const { data } = await supabase.from("orders").select("*").eq("id", id).single();
  return data;
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data } = await supabase
    .from("orders").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const timeMap: Partial<Record<OrderStatus, string>> = {
    confirmed: "confirmed_at",
    out_for_delivery: "out_for_delivery_at",
    delivered: "delivered_at",
  };
  await supabase.from("orders").update({
    status,
    ...(timeMap[status] ? { [timeMap[status]!]: new Date().toISOString() } : {}),
  }).eq("id", id);
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<void> {
  await supabase.from("profiles").upsert({ ...profile, updated_at: new Date().toISOString() });
}
