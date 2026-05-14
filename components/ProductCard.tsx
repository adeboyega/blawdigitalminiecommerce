"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ImageOff, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { toggle, has } = useWishlistStore();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    useWishlistStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    setWishlisted(has(product.id));
  }, [has, product.id]);

  function handleAddToCart() {
    addItem(product);
    openCart();
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    toggle(product);
    setWishlisted(has(product.id));
  }

  const isOutOfStock = product.stock_qty <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm transition hover:shadow-md">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-700">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-500">
            <ImageOff className="h-12 w-12" />
          </div>
        )}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-zinc-800/90 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 shadow-sm backdrop-blur">
            {product.category}
          </span>
        )}
        {/* Wishlist heart */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition active:scale-90 ${
            wishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 dark:bg-zinc-800/90 text-zinc-400 hover:text-red-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-800">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <Link href={`/product/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition hover:text-[#82C341]">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ₦{product.price.toLocaleString("en-NG")}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 rounded-full bg-[#82C341] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
