"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

export default function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { addItem, openCart } = useCartStore();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  function handleClick() {
    addItem(product);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#82C341] py-4 text-base font-bold text-white shadow-lg shadow-[#82C341]/30 transition hover:bg-[#6da832] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {added ? (
        <>
          <Check className="h-5 w-5" />
          Added to cart!
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          {disabled ? "Out of Stock" : "Add to Cart"}
        </>
      )}
    </button>
  );
}
