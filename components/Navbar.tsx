"use client";

import { Search, ShoppingCart, User, Zap, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

interface NavbarProps {
  onSearchChange: (value: string) => void;
  searchValue: string;
  categories?: string[];
}

export default function Navbar({ onSearchChange, searchValue, categories = [] }: NavbarProps) {
  const { totalItems, openCart } = useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* Tier 1 — utility bar */}
      <div className="bg-[#82C341]">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs text-white sm:px-6 lg:px-8">
          <span className="hidden sm:block">
            🚚 Free shipping on orders over $50
          </span>
          <span className="block sm:hidden">Free shipping over $50</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-0.5 opacity-90 hover:opacity-100">
              NGN ₦ <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-0.5 opacity-90 hover:opacity-100">
              EN <ChevronDown className="h-3 w-3" />
            </button>
            <span className="opacity-30">|</span>
            <button className="opacity-90 hover:opacity-100">Sign In</button>
            <button className="font-semibold hover:opacity-90">Register</button>
          </div>
        </div>
      </div>

      {/* Tier 2 — main bar */}
      <div className="bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#82C341]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900">
              Whazz<span className="text-[#82C341]">online</span>
            </span>
          </a>

          {/* Pill search */}
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search for products, brands and more…"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-full rounded-full border-2 border-zinc-200 bg-zinc-50 pl-5 pr-14 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#82C341] focus:bg-white focus:ring-4 focus:ring-[#82C341]/10"
            />
            <button
              aria-label="Search"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#82C341] text-white transition hover:bg-[#6da832]"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Icons */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Profile circle */}
            <button
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-200 text-zinc-600 transition hover:border-[#82C341] hover:text-[#82C341]"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Cart FAB */}
            <button
              onClick={openCart}
              aria-label="Open cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#82C341] text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] hover:shadow-[#82C341]/40"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems() > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2d0a6b] text-[10px] font-black text-white">
                  {totalItems() > 99 ? "99+" : totalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 3 — nav strip */}
      <div className="border-t border-zinc-100 bg-white">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <button className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-[#82C341]/10 hover:text-[#82C341]">
            All Categories
          </button>
          <span className="text-zinc-200">|</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-zinc-500 transition hover:bg-[#82C341]/10 hover:text-[#82C341]"
            >
              {cat}
            </button>
          ))}
          <button className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-[#82C341] transition hover:bg-[#82C341]/10">
            Today&apos;s Deals →
          </button>
        </div>
      </div>
    </header>
  );
}
