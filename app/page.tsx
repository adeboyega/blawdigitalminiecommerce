import { fetchProducts, fetchCategories } from "@/services/supabase";
import ProductsClient from "@/components/ProductsClient";

export const revalidate = 60;

function timeout<T>(ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(fallback), ms));
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    Promise.race([fetchProducts(), timeout(8000, [])]),
    Promise.race([fetchCategories(), timeout(8000, [])]),
  ]);

  return <ProductsClient products={products} categories={categories} />;
}
