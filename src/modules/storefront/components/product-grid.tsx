import { PackageOpen } from "lucide-react";
import type { StorefrontProduct } from "../types";
import { ProductCard } from "./product-card";
import { ProductListItem } from "./product-list-item";

interface ProductGridProps {
  products: StorefrontProduct[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No products match this category.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center sm:py-20">
        <PackageOpen className="mb-4 size-12 text-muted-foreground" />
        <h2 className="font-heading text-xl font-semibold">No products to show</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  if (products.length === 1) {
    const product = products[0]!;
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="sm:hidden">
          <ProductListItem product={product} priority />
        </div>
        <div className="hidden sm:block">
          <ProductCard product={product} priority />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 sm:hidden">
        {products.map((product, index) => (
          <ProductListItem
            key={product.id}
            product={product}
            priority={index === 0}
          />
        ))}
      </div>

      <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index === 0}
          />
        ))}
      </div>
    </>
  );
}
