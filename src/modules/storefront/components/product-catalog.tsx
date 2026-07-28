"use client";

import { useMemo, useState } from "react";
import { matchesCategoryFilter, sortCategoryNames } from "@/modules/common/lib/category-match";
import type { StorefrontProduct } from "../types";
import { ProductGrid } from "./product-grid";

interface ProductCatalogProps {
  products: StorefrontProduct[];
  categories: string[];
}

export function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const sortedCategories = useMemo(
    () => sortCategoryNames(categories),
    [categories],
  );
  const filterCategories = useMemo(
    () => ["All", ...sortedCategories],
    [sortedCategories],
  );

  const [activeCategory, setActiveCategory] = useState("All");
  const showFilters = products.length > 1 && filterCategories.length > 2;

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((product) =>
      matchesCategoryFilter(product.category, activeCategory, sortedCategories),
    );
  }, [activeCategory, products, sortedCategories]);

  const emptyMessage =
    products.length === 0
      ? "New products will show up here once they are added from the admin panel."
      : "Try another category to see more products.";

  return (
    <section id="picks" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            All products
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Deals worth the click
          </h2>
        </div>

        {showFilters ? (
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filterCategories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <ProductGrid products={filteredProducts} emptyMessage={emptyMessage} />
      </div>
    </section>
  );
}
