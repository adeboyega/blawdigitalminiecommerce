"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ImageOff, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";

interface SearchModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ products, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim().length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSelect(product: Product) {
    onClose();
    router.push(`/product/${product.id}`);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-3 pt-4 sm:px-4 sm:pt-20">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 px-4 py-3.5">
              <Search className="h-5 w-5 shrink-0 text-[#82C341]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories…"
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
              />
              {query ? (
                <button
                  onClick={() => setQuery("")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results area */}
            <div className="max-h-[65vh] overflow-y-auto">
              {query.trim() === "" ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Search className="h-8 w-8 text-zinc-200 dark:text-zinc-700" />
                  <p className="text-sm text-zinc-400">Start typing to find products…</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-zinc-500">No results for</p>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">&ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-zinc-400">Try a different search term</p>
                </div>
              ) : (
                <>
                  <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  <ul>
                    {results.map((product) => (
                      <li key={product.id}>
                        <button
                          onClick={() => handleSelect(product)}
                          className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-700">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                <ImageOff className="h-4 w-4" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                              {product.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2">
                              {product.category && (
                                <span className="rounded-full bg-[#82C341]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5a9a2c]">
                                  {product.category}
                                </span>
                              )}
                              {product.stock_qty <= 0 && (
                                <span className="text-[10px] text-red-400">Out of stock</span>
                              )}
                            </div>
                          </div>

                          {/* Price + arrow */}
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                              ₦{product.price.toLocaleString("en-NG")}
                            </span>
                            <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:text-[#82C341]" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
