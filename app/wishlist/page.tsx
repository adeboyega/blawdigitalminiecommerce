"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowLeft, ImageOff } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";

export default function WishlistPage() {
  const router = useRouter();
  const { items, remove } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-[#82C341]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </button>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">My Wishlist</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-24 text-center shadow-sm"
          >
            <Heart className="h-14 w-14 text-zinc-200 dark:text-zinc-700" />
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your wishlist is empty</p>
            <p className="text-sm text-zinc-500">Save products you love and come back to them later.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-2 rounded-xl bg-[#82C341] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 hover:bg-[#6da832]"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <>
            <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
              {items.length} saved item{items.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {items.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-500">
                          <ImageOff className="h-10 w-10" />
                        </div>
                      )}
                      {product.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-zinc-800/90 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 backdrop-blur">
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                        ₦{product.price.toLocaleString("en-NG")}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { addItem(product); openCart(); }}
                          disabled={product.stock_qty <= 0}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#82C341] py-2.5 text-xs font-bold text-white shadow-sm shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-95 disabled:opacity-40"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          {product.stock_qty <= 0 ? "Out of stock" : "Add to Cart"}
                        </button>
                        <button
                          onClick={() => remove(product.id)}
                          aria-label="Remove from wishlist"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-200 dark:border-zinc-600 text-zinc-400 transition hover:border-red-300 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
