"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { sortCategoryNames } from "@/modules/common/lib/category-match";
import { Button } from "@/modules/common/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/modules/common/ui/sheet";
import {
  countActiveFilters,
  DEFAULT_PRODUCT_FILTERS,
  filterProducts,
  getBrandOptions,
  getBreedSizeFilterOptions,
  getFlavorFilterOptions,
  getFoodTypeFilterOptions,
  getLifeStageFilterOptions,
  getPackWeightBounds,
  getPetTypeFilterOptions,
  getPriceBounds,
  PRODUCT_SORT_OPTIONS,
  type ProductFilterState,
} from "../lib/filter-products";
import type { StorefrontProduct } from "../types";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";

interface ProductCatalogProps {
  products: StorefrontProduct[];
  categories: string[];
}

function ProductCatalogContent({ products, categories }: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const sortedCategories = useMemo(
    () => sortCategoryNames(categories),
    [categories],
  );
  const brandOptions = useMemo(() => getBrandOptions(products), [products]);
  const petTypeOptions = useMemo(
    () => getPetTypeFilterOptions(products),
    [products],
  );
  const lifeStageOptions = useMemo(
    () => getLifeStageFilterOptions(products),
    [products],
  );
  const breedSizeOptions = useMemo(
    () => getBreedSizeFilterOptions(products),
    [products],
  );
  const foodTypeOptions = useMemo(
    () => getFoodTypeFilterOptions(products),
    [products],
  );
  const flavorOptions = useMemo(
    () => getFlavorFilterOptions(products),
    [products],
  );
  const priceBounds = useMemo(() => getPriceBounds(products), [products]);
  const packWeightBounds = useMemo(
    () => getPackWeightBounds(products),
    [products],
  );
  const currency = products[0]?.currency ?? "INR";

  const [filters, setFilters] = useState<ProductFilterState>(
    DEFAULT_PRODUCT_FILTERS,
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q") ?? "";
    setFilters((current) =>
      current.query === query ? current : { ...current, query },
    );
  }, [searchParams]);

  const filteredProducts = useMemo(
    () => filterProducts(products, filters, sortedCategories),
    [filters, products, sortedCategories],
  );

  const activeFilterCount = countActiveFilters(filters);

  function handleClearFilters() {
    setFilters(DEFAULT_PRODUCT_FILTERS);
  }

  const emptyMessage =
    products.length === 0
      ? "New products will show up here once they are added from the admin panel."
      : activeFilterCount > 0
        ? "No products match your filters. Try clearing a few options."
        : "Try another category to see more products.";

  return (
    <section id="picks" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          All products
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Shop all products
        </h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse food, treats, and essentials by pet type, life stage, flavor,
          pack size, brand, and price.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-24 rounded-2xl border border-border/80 bg-background p-5 shadow-sm">
            <ProductFilters
              filters={filters}
              categories={sortedCategories}
              brands={brandOptions}
              petTypes={petTypeOptions}
              lifeStages={lifeStageOptions}
              breedSizes={breedSizeOptions}
              foodTypes={foodTypeOptions}
              flavors={flavorOptions}
              priceBounds={priceBounds}
              packWeightBounds={packWeightBounds}
              currency={currency}
              onChange={setFilters}
              onClear={handleClearFilters}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              {filters.query ? (
                <p className="text-xs text-muted-foreground">
                  Search: “{filters.query}”
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      className="rounded-full md:hidden"
                    />
                  }
                >
                  <SlidersHorizontal data-icon="inline-start" />
                  Filters
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </SheetTrigger>
                <SheetContent side="left" className="w-[min(100vw-2rem,22rem)]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 overflow-y-auto pb-8">
                    <ProductFilters
                      filters={filters}
                      categories={sortedCategories}
                      brands={brandOptions}
                      petTypes={petTypeOptions}
                      lifeStages={lifeStageOptions}
                      breedSizes={breedSizeOptions}
                      foodTypes={foodTypeOptions}
                      flavors={flavorOptions}
                      priceBounds={priceBounds}
                      packWeightBounds={packWeightBounds}
                      currency={currency}
                      onChange={setFilters}
                      onClear={() => {
                        handleClearFilters();
                        setMobileFiltersOpen(false);
                      }}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Select
                value={filters.sort}
                onValueChange={(value) => {
                  if (!value) return;
                  setFilters((current) => ({
                    ...current,
                    sort: value as ProductFilterState["sort"],
                  }));
                }}
              >
                <SelectTrigger className="h-9 w-full min-w-[180px] rounded-full sm:w-52">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProductGrid products={filteredProducts} emptyMessage={emptyMessage} />
        </div>
      </div>
    </section>
  );
}

export function ProductCatalog(props: ProductCatalogProps) {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="h-40 animate-pulse rounded-2xl bg-muted/40" />
        </section>
      }
    >
      <ProductCatalogContent {...props} />
    </Suspense>
  );
}
