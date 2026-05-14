import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

interface WishlistStore {
  items: Product[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => set((s) => ({ items: [...s.items, product] })),
      remove: (id) => set((s) => ({ items: s.items.filter((p) => p.id !== id) })),
      toggle: (product) => {
        get().has(product.id) ? get().remove(product.id) : get().add(product);
      },
      has: (id) => get().items.some((p) => p.id === id),
      count: () => get().items.length,
    }),
    { name: "whazzonline-wishlist", skipHydration: true }
  )
);
