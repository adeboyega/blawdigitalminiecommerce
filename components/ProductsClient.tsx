"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid,
  Tag,
  Watch,
  ShoppingBag,
  Cpu,
  Home,
  Shirt,
  ArrowUp,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import type { Product } from "@/types";

interface ProductsClientProps {
  products: Product[];
  categories: string[];
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Electronics: Cpu,
  Accessories: Watch,
  Bags: ShoppingBag,
  Footwear: Tag,
  Home: Home,
  Fashion: Shirt,
};

function getCategoryIcon(cat: string): LucideIcon {
  return CATEGORY_ICONS[cat] ?? Tag;
}

export default function ProductsClient({ products, categories }: ProductsClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, search, activeCategory]);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar
        searchValue={search}
        onSearchChange={setSearch}
        categories={categories}
      />
      <CartDrawer />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col items-center gap-10 py-12 lg:flex-row lg:py-16">
            {/* Left — text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="mb-4 inline-block rounded-full bg-[#82C341]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#5a9a2c]">
                New Arrivals 🎉
              </span>
              <h1 className="text-5xl font-black leading-tight tracking-tight text-[#2d0a6b] lg:text-6xl">
                Shop &amp; Pay
                <br />
                <span className="text-[#82C341]">Smarter.</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-zinc-500">
                Discover thousands of products at unbeatable prices.
                Fast delivery, easy returns — no hassle.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <button
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded-full bg-[#82C341] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-95"
                >
                  Shop Now
                </button>
                <button className="rounded-full border-2 border-[#2d0a6b] px-7 py-3.5 text-sm font-bold text-[#2d0a6b] transition hover:bg-[#2d0a6b] hover:text-white active:scale-95">
                  View Deals
                </button>
              </div>
            </div>

            {/* Right — decorative */}
            <div className="relative flex h-72 w-72 shrink-0 items-center justify-center lg:h-80 lg:w-80">
              <div className="absolute inset-0 rounded-full bg-[#82C341]/10" />
              <div className="absolute inset-6 rounded-full bg-[#82C341]/20" />
              <div className="absolute inset-12 rounded-full bg-[#82C341]/30" />
              <div className="absolute inset-20 flex items-center justify-center rounded-full bg-[#82C341] shadow-2xl shadow-[#82C341]/40">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
              {/* Floating stat — products */}
              <div className="absolute -right-4 top-8 rounded-2xl bg-white px-4 py-2.5 text-center shadow-xl">
                <p className="text-xl font-black text-[#82C341]">{products.length}+</p>
                <p className="text-xs text-zinc-500">Products</p>
              </div>
              {/* Floating stat — free shipping */}
              <div className="absolute -left-4 bottom-8 rounded-2xl bg-white px-4 py-2.5 text-center shadow-xl">
                <p className="text-xl font-black text-[#2d0a6b]">Free</p>
                <p className="text-xs text-zinc-500">Shipping</p>
              </div>
              {/* Floating stat — categories */}
              <div className="absolute -top-2 left-8 rounded-2xl bg-[#2d0a6b] px-4 py-2.5 text-center shadow-xl">
                <p className="text-xl font-black text-white">{categories.length}</p>
                <p className="text-xs text-white/70">Categories</p>
              </div>
            </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-[#82C341]/5" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-violet-100/40" />
      </section>

      {/* Main content */}
      <main
        id="products"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="flex gap-6">
          {/* Categories sidebar — desktop */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-[130px] rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
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
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
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
                        onClick={() =>
                          setActiveCategory(cat === activeCategory ? null : cat)
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          activeCategory === cat
                            ? "bg-[#82C341] text-white shadow-md shadow-[#82C341]/30"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {cat}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 rounded-xl bg-[#82C341]/8 p-3 text-center">
                <p className="text-xs font-semibold text-[#5a9a2c]">
                  🎁 Free shipping
                </p>
                <p className="text-[11px] text-zinc-500">on orders over $50</p>
              </div>
            </div>
          </aside>

          {/* Products area */}
          <div className="min-w-0 flex-1">
            {/* Mobile category pills */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === null
                    ? "bg-[#82C341] text-white"
                    : "border border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(cat === activeCategory ? null : cat)
                  }
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    activeCategory === cat
                      ? "bg-[#82C341] text-white"
                      : "border border-zinc-200 bg-white text-zinc-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Result count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                <span className="font-semibold text-zinc-900">{filtered.length}</span>{" "}
                product{filtered.length !== 1 ? "s" : ""}
                {activeCategory && (
                  <span className="text-[#82C341]"> in {activeCategory}</span>
                )}
                {search && <span> matching &ldquo;{search}&rdquo;</span>}
              </p>
            </div>

            <ProductGrid products={filtered} />
          </div>
        </div>
      </main>

      {/* Floating Action Buttons — left margin */}
      <div className="fixed bottom-8 left-4 z-30 flex flex-col gap-3 lg:left-6">
        <button
          aria-label="Chat support"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2d0a6b] text-white shadow-lg shadow-[#2d0a6b]/30 transition hover:bg-[#3d1490] active:scale-95"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
        {showScrollTop && (
          <button
            onClick={scrollTop}
            aria-label="Scroll to top"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#82C341] text-white shadow-lg shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-95"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
