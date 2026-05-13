"use client";

import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, ImageOff } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect } from "react";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, clearCart } =
    useCartStore();

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
            <ShoppingBag className="h-5 w-5 text-[#82C341]" />
            Your Cart
            {items.length > 0 && (
              <span className="ml-1 rounded-full bg-[#82C341]/10 px-2 py-0.5 text-xs font-bold text-[#5a9a2c]">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-400">
              <ShoppingBag className="h-12 w-12" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs">Add some products to get started</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-4 rounded-xl border border-zinc-100 p-3"
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-300">
                        <ImageOff className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
                    <div>
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-zinc-500">{product.category}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-900">
                        ₦{(product.price * quantity).toLocaleString("en-NG")}
                      </span>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeItem(product.id)}
                          aria-label="Remove item"
                          className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-red-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="text-xl font-bold text-zinc-900">
                ₦{subtotal().toLocaleString("en-NG")}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Shipping &amp; taxes calculated at checkout
            </p>
            <button className="w-full rounded-xl bg-[#82C341] py-3.5 text-sm font-bold text-white shadow-md shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-[0.98]">
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full rounded-xl border border-zinc-200 py-2.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
