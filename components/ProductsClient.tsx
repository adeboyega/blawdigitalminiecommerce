"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid, Tag, Watch, ShoppingBag, Cpu, Home, Shirt, ArrowUp, MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import SearchModal from "@/components/SearchModal";
import type { Product } from "@/types";

interface ProductsClientProps {
  products: Product[];
  categories: string[];
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Electronics: Cpu, Accessories: Watch, Bags: ShoppingBag,
  Footwear: Tag, Home: Home, Fashion: Shirt,
};

function getCategoryIcon(cat: string): LucideIcon {
  return CATEGORY_ICONS[cat] ?? Tag;
}

export default function ProductsClient({ products, categories }: ProductsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() { setShowScrollTop(window.scrollY > 400); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory) return products.filter((p) => p.category === activeCategory);
    return products;
  }, [products, activeCategory]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar
        onSearchOpen={() => setShowSearch(true)}
        categories={categories}
      />
      <CartDrawer />
      <SearchModal
        products={products}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col items-center gap-8 py-10 sm:py-12 lg:flex-row lg:py-16">

            {/* Left — text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="mb-3 inline-block rounded-full bg-[#82C341]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#5a9a2c]">
                New Arrivals 🎉
              </span>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-[#2d0a6b] sm:text-5xl lg:text-6xl">
                Shop &amp; Pay
                <br />
                <span className="text-[#82C341]">Smarter.</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
                Discover thousands of products at unbeatable prices.
                Fast delivery, easy returns — no hassle.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <button
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-full bg-[#82C341] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-95 sm:px-7 sm:py-3.5"
                >
                  Shop Now
                </button>
                <button className="rounded-full border-2 border-[#2d0a6b] px-6 py-3 text-sm font-bold text-[#2d0a6b] transition hover:bg-[#2d0a6b] hover:text-white active:scale-95 sm:px-7 sm:py-3.5">
                  View Deals
                </button>
              </div>

              {/* Stat pills on mobile (replaces the decorative circle) */}
              <div className="mt-6 flex items-center justify-center gap-3 lg:hidden">
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-center shadow-sm">
                  <p className="text-lg font-black text-[#82C341]">{products.length}+</p>
                  <p className="text-[10px] text-zinc-500">Products</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-center shadow-sm">
                  <p className="text-lg font-black text-[#2d0a6b]">Free</p>
                  <p className="text-[10px] text-zinc-500">Delivery</p>
                </div>
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-[#2d0a6b] px-4 py-2 text-center shadow-sm">
                  <p className="text-lg font-black text-white">{categories.length}</p>
                  <p className="text-[10px] text-white/70">Categories</p>
                </div>
              </div>
            </div>

            {/* Right — decorative circle (desktop only) */}
            <div className="relative hidden h-72 w-72 shrink-0 items-center justify-center lg:flex lg:h-80 lg:w-80">
              <div className="absolute inset-0 rounded-full bg-[#82C341]/10" />
              <div className="absolute inset-6 rounded-full bg-[#82C341]/20" />
              <div className="absolute inset-12 rounded-full bg-[#82C341]/30" />
              <div className="absolute inset-20 flex items-center justify-center rounded-full bg-[#82C341] shadow-2xl shadow-[#82C341]/40">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -right-4 top-8 rounded-2xl bg-white dark:bg-zinc-800 px-4 py-2.5 text-center shadow-xl">
                <p className="text-xl font-black text-[#82C341]">{products.length}+</p>
                <p className="text-xs text-zinc-500">Products</p>
              </div>
              <div className="absolute -left-4 bottom-8 rounded-2xl bg-white dark:bg-zinc-800 px-4 py-2.5 text-center shadow-xl">
                <p className="text-xl font-black text-[#2d0a6b]">Free</p>
                <p className="text-xs text-zinc-500">Shipping</p>
              </div>
              <div className="absolute -top-2 left-8 rounded-2xl bg-[#2d0a6b] px-4 py-2.5 text-center shadow-xl">
                <p className="text-xl font-black text-white">{categories.length}</p>
                <p className="text-xs text-white/70">Categories</p>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#82C341]/5" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-violet-100/40 dark:bg-violet-900/10" />
      </section>

      {/* Main content */}
      <main id="products" className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex gap-6">

          {/* Sidebar — desktop only */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-[130px] rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
              <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Categories
              </p>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      activeCategory === null
                        ? "bg-[#82C341] text-white shadow-md shadow-[#82C341]/30"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4 shrink-0" />
                    All Products
                  </button>
                </li>
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat);
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          activeCategory === cat
                            ? "bg-[#82C341] text-white shadow-md shadow-[#82C341]/30"
                            : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {cat}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 rounded-xl bg-[#82C341]/10 p-3 text-center">
                <p className="text-xs font-semibold text-[#5a9a2c]">🎁 Free delivery</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">on orders over ₦50,000</p>
              </div>
            </div>
          </aside>

          {/* Products area */}
          <div className="min-w-0 flex-1">
            {/* Mobile category pills */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  activeCategory === null
                    ? "bg-[#82C341] text-white"
                    : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? "bg-[#82C341] text-white"
                      : "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Result count */}
            <div className="mb-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{filtered.length}</span>{" "}
                product{filtered.length !== 1 ? "s" : ""}
                {activeCategory && <span className="text-[#82C341]"> in {activeCategory}</span>}
              </p>
            </div>

            <ProductGrid products={filtered} />
          </div>
        </div>
      </main>

      {/* FABs */}
      <div className="fixed bottom-6 left-3 z-30 flex flex-col gap-3 sm:bottom-8 sm:left-4 lg:left-6">
        <button
          aria-label="Chat support"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2d0a6b] text-white shadow-lg shadow-[#2d0a6b]/30 transition hover:bg-[#3d1490] active:scale-95 sm:h-12 sm:w-12"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#82C341] text-white shadow-lg shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-95 sm:h-12 sm:w-12"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
