import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product:", error.message);
    return null;
  }

  return data;
}

export async function uploadProductImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(filename, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("product-images")
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  const unique = [...new Set((data ?? []).map((r) => r.category as string))];
  return unique.sort();
}
