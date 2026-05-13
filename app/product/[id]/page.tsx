import { fetchProductById, fetchProducts } from "@/services/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageOff, Tag, Package, Calendar } from "lucide-react";
import type { Metadata } from "next";
import AddToCartButton from "@/components/AddToCartButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await fetchProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — Whazzonline`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) notFound();

  const isOutOfStock = product.stock_qty <= 0;
  const formattedDate = new Date(product.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Simple top bar */}
      <header className="border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300">
                <ImageOff className="h-20 w-20" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            {product.category && (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#82C341]/10 px-3 py-1 text-xs font-semibold text-[#5a9a2c]">
                <Tag className="h-3 w-3" />
                {product.category}
              </span>
            )}

            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              {product.name}
            </h1>

            <p className="text-4xl font-extrabold text-zinc-900">
              ₦{product.price.toLocaleString("en-NG")}
            </p>

            {product.description && (
              <p className="text-base leading-relaxed text-zinc-600">
                {product.description}
              </p>
            )}

            {/* Specifications */}
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Specifications
              </h2>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm text-zinc-500">
                    <Package className="h-4 w-4" />
                    Stock
                  </dt>
                  <dd className="text-sm font-semibold text-zinc-900">
                    {isOutOfStock ? (
                      <span className="text-red-500">Out of stock</span>
                    ) : (
                      <span className="text-emerald-600">{product.stock_qty} available</span>
                    )}
                  </dd>
                </div>
                {product.category && (
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2 text-sm text-zinc-500">
                      <Tag className="h-4 w-4" />
                      Category
                    </dt>
                    <dd className="text-sm font-semibold text-zinc-900">
                      {product.category}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-sm text-zinc-500">
                    <Calendar className="h-4 w-4" />
                    Added
                  </dt>
                  <dd className="text-sm font-semibold text-zinc-900">
                    {formattedDate}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Add to cart */}
            <AddToCartButton product={product} disabled={isOutOfStock} />
          </div>
        </div>
      </main>
    </div>
  );
}
