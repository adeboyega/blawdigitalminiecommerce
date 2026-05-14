"use client";

import { Search, ShoppingCart, User, Zap, ChevronDown, LogOut, Package, Heart, Sun, Moon } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/services/supabase";
import type { User as SupaUser } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";
import { useThemeStore } from "@/store/themeStore";
import { useWishlistStore } from "@/store/wishlistStore";

interface NavbarProps {
  onSearchOpen: () => void;
  categories?: string[];
}

export default function Navbar({ onSearchOpen, categories = [] }: NavbarProps) {
  const { totalItems, openCart } = useCartStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const wishlistCount = useWishlistStore((s) => s.count);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
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
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-3 text-xs text-white sm:px-6 lg:px-8">
            <span className="hidden sm:block">🚚 Free delivery on orders over ₦50,000</span>
            <span className="block text-[11px] sm:hidden">Free delivery over ₦50,000</span>
            <div className="flex items-center gap-3">
              {/* Hide currency/lang on mobile to save space */}
              <button className="hidden items-center gap-0.5 opacity-90 hover:opacity-100 sm:flex">
                NGN ₦ <ChevronDown className="h-3 w-3" />
              </button>
              <span className="hidden opacity-30 sm:block">|</span>
              {user ? (
                <span className="max-w-[100px] truncate font-semibold text-[11px] sm:text-xs">
                  {user.email?.split("@")[0]}
                </span>
              ) : (
                <>
                  <button onClick={() => setShowAuth(true)} className="opacity-90 hover:opacity-100">
                    Sign In
                  </button>
                  <button onClick={() => setShowAuth(true)} className="font-semibold hover:opacity-90">
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2 — main bar */}
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">

            {/* Logo */}
            <a href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#82C341] sm:h-9 sm:w-9">
                <Zap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white sm:text-xl">
                Whazz<span className="text-[#82C341]">online</span>
              </span>
            </a>

            {/* Search bar — desktop only */}
            <button
              onClick={onSearchOpen}
              className="relative hidden flex-1 sm:block"
            >
              <div className="flex h-11 w-full items-center gap-3 rounded-full border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-5 pr-14 text-sm text-zinc-400 transition hover:border-[#82C341] hover:bg-white dark:hover:bg-zinc-700">
                Search for products, brands and more…
              </div>
              <div className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#82C341] text-white">
                <Search className="h-4 w-4" />
              </div>
            </button>

            {/* Spacer on mobile */}
            <div className="flex-1 sm:hidden" />

            {/* Icons — mobile */}
            <div className="flex items-center gap-1 sm:hidden">
              {/* Search */}
              <button
                onClick={onSearchOpen}
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  aria-label="Account"
                  onClick={() => user ? setShowDropdown((d) => !d) : setShowAuth(true)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                    user
                      ? "border-[#82C341] bg-[#82C341]/10 text-[#82C341]"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <User className="h-4 w-4" />
                </button>
                {showDropdown && user && (
                  <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 shadow-xl">
                    <div className="mb-1 border-b border-zinc-100 dark:border-zinc-700 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{user.email}</p>
                      <p className="mt-0.5">Signed in</p>
                    </div>
                    <a
                      href="/orders"
                      onClick={() => setShowDropdown(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <Package className="h-3.5 w-3.5 text-[#82C341]" /> My Orders
                    </a>
                    <button
                      onClick={async () => { await supabase.auth.signOut(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <a
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              >
                <Heart className="h-4 w-4" />
                {wishlistCount() > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                    {wishlistCount() > 9 ? "9+" : wishlistCount()}
                  </span>
                )}
              </a>

              {/* Cart */}
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#82C341] text-white shadow-md shadow-[#82C341]/30"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems() > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2d0a6b] text-[9px] font-black text-white">
                    {totalItems() > 9 ? "9+" : totalItems()}
                  </span>
                )}
              </button>
            </div>

            {/* Icons — desktop: all icons */}
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 transition hover:border-[#82C341] hover:text-[#82C341]"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Wishlist */}
              <a
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 transition hover:border-red-400 hover:text-red-500"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount() > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    {wishlistCount() > 99 ? "99+" : wishlistCount()}
                  </span>
                )}
              </a>

              {/* Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  aria-label="Account"
                  onClick={() => user ? setShowDropdown((d) => !d) : setShowAuth(true)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                    user
                      ? "border-[#82C341] bg-[#82C341]/10 text-[#82C341]"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-[#82C341] hover:text-[#82C341]"
                  }`}
                >
                  <User className="h-5 w-5" />
                </button>
                {showDropdown && user && (
                  <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 shadow-xl">
                    <div className="mb-1 border-b border-zinc-100 dark:border-zinc-700 px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">{user.email}</p>
                      <p className="mt-0.5">Signed in</p>
                    </div>
                    <a
                      href="/orders"
                      onClick={() => setShowDropdown(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <Package className="h-3.5 w-3.5 text-[#82C341]" /> My Orders
                    </a>
                    <button
                      onClick={async () => { await supabase.auth.signOut(); setShowDropdown(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#82C341] text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832]"
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
        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="mx-auto flex h-9 max-w-7xl items-center gap-1 overflow-x-auto px-3 sm:px-6 lg:px-8" style={{ scrollbarWidth: "none" }}>
            <button className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition hover:bg-[#82C341]/10 hover:text-[#82C341]">
              All
            </button>
            <span className="text-zinc-200 dark:text-zinc-700">|</span>
            {categories.map((cat) => (
              <button
                key={cat}
                className="shrink-0 rounded-full px-3 py-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 transition hover:bg-[#82C341]/10 hover:text-[#82C341]"
              >
                {cat}
              </button>
            ))}
            <button className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-[#82C341] transition hover:bg-[#82C341]/10 whitespace-nowrap">
              Today&apos;s Deals →
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
