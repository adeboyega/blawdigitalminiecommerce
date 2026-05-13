"use client";

import { Search, ShoppingCart, User, Zap, ChevronDown, LogOut, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/services/supabase";
import type { User as SupaUser } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";

interface NavbarProps {
  onSearchChange: (value: string) => void;
  searchValue: string;
  categories?: string[];
}

export default function Navbar({ onSearchChange, searchValue, categories = [] }: NavbarProps) {
  const { totalItems, openCart } = useCartStore();
  const [user, setUser] = useState<SupaUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
    {showAuth && (
      <AuthModal
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
      />
    )}
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* Tier 1 — utility bar */}
      <div className="bg-[#82C341]">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-xs text-white sm:px-6 lg:px-8">
          <span className="hidden sm:block">
            🚚 Free delivery on orders over ₦50,000
          </span>
          <span className="block sm:hidden">Free delivery over ₦50,000</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-0.5 opacity-90 hover:opacity-100">
              NGN ₦ <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-0.5 opacity-90 hover:opacity-100">
              EN <ChevronDown className="h-3 w-3" />
            </button>
            <span className="opacity-30">|</span>
            {user ? (
              <span className="font-semibold truncate max-w-[120px]">
                {user.email?.split("@")[0]}
              </span>
            ) : (
              <>
                <button onClick={() => setShowAuth(true)} className="opacity-90 hover:opacity-100">Sign In</button>
                <button onClick={() => setShowAuth(true)} className="font-semibold hover:opacity-90">Register</button>
              </>
            )}
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
            <div className="relative" ref={dropdownRef}>
              <button
                aria-label="Account"
                onClick={() => user ? setShowDropdown(d => !d) : setShowAuth(true)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                  user
                    ? "border-[#82C341] bg-[#82C341]/10 text-[#82C341]"
                    : "border-zinc-200 text-zinc-600 hover:border-[#82C341] hover:text-[#82C341]"
                }`}
              >
                <User className="h-5 w-5" />
              </button>
              {showDropdown && user && (
                <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-zinc-100 bg-white p-2 shadow-xl">
                  <div className="px-3 py-2 text-xs text-zinc-500 border-b border-zinc-100 mb-1">
                    <p className="font-semibold text-zinc-900 truncate">{user.email}</p>
                    <p className="mt-0.5">Signed in</p>
                  </div>
                  <a
                    href="/orders"
                    onClick={() => setShowDropdown(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                  >
                    <Package className="h-3.5 w-3.5 text-[#82C341]" /> My Orders
                  </a>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>

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
    </>
  );
}
