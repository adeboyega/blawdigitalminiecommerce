import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-400">
        <PackageSearch className="h-12 w-12" />
        <p className="text-sm font-medium">No products found</p>
        <p className="text-xs">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
