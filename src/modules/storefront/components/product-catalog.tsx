"use client";

import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, SlidersHorizontal } from "lucide-react";
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
import type { CatalogFacets } from "../lib/catalog-facets";
import {
  catalogHref,
  CATALOG_PAGE_SIZE,
  parseCatalogFilters,
} from "../lib/catalog-search-params";
import {
  countActiveFilters,
  DEFAULT_PRODUCT_FILTERS,
  PRODUCT_SORT_OPTIONS,
  type ProductFilterState,
} from "../lib/filter-products";
import type { StorefrontProduct } from "../types";
import { ActiveFilterChips } from "./active-filter-chips";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";

interface ProductCatalogProps {
  products: StorefrontProduct[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
  facets: CatalogFacets;
}

const FILTER_LOADING_MIN_MS = 320;
const FILTER_LOADING_MAX_MS = 8000;

function ProductCatalogContent({
  products,
  total,
  page,
  totalPages,
  categories,
  facets,
}: ProductCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const loadStartedAt = useRef(0);
  const sortedCategories = sortCategoryNames(categories);
  const filters = parseCatalogFilters(searchParams);
  const activeFilterCount = countActiveFilters(filters);
  const showFilterLoading = isFilterLoading || isPending;

  function navigate(nextFilters: ProductFilterState, nextPage = 1) {
    loadStartedAt.current = Date.now();
    setIsFilterLoading(true);
    startTransition(() => {
      router.push(catalogHref(nextFilters, nextPage), { scroll: false });
    });
  }

  useEffect(() => {
    if (!isFilterLoading) return;

    const elapsed = Date.now() - loadStartedAt.current;
    if (elapsed < 20) return;

    const wait = Math.max(0, FILTER_LOADING_MIN_MS - elapsed);
    const timeout = window.setTimeout(() => {
      setIsFilterLoading(false);
    }, wait);

    return () => window.clearTimeout(timeout);
  }, [facets, isFilterLoading, page, products, total]);

  useEffect(() => {
    if (!isFilterLoading) return;

    const timeout = window.setTimeout(() => {
      setIsFilterLoading(false);
    }, FILTER_LOADING_MAX_MS);

    return () => window.clearTimeout(timeout);
  }, [isFilterLoading]);

  function handleClearFilters() {
    navigate(DEFAULT_PRODUCT_FILTERS, 1);
  }

  const emptyMessage =
    total === 0 && activeFilterCount === 0
      ? "New products will show up here once they are added from the admin panel."
      : activeFilterCount > 0
        ? "No products match your filters. Try clearing a few options."
        : "Try another category to see more products.";

  const showingFrom =
    total === 0 ? 0 : (page - 1) * CATALOG_PAGE_SIZE + 1;
  const showingTo = Math.min(page * CATALOG_PAGE_SIZE, total);

  const filterPanel = (
    <ProductFilters
      filters={filters}
      categories={sortedCategories}
      brands={facets.brands}
      petTypes={facets.petTypes}
      lifeStages={facets.lifeStages}
      breedSizes={facets.breedSizes}
      foodTypes={facets.foodTypes}
      flavors={facets.flavors}
      priceBounds={facets.priceBounds}
      packWeightBounds={facets.packWeightBounds}
      currency={facets.currency}
      onChange={(next) => navigate(next, 1)}
      onClear={handleClearFilters}
    />
  );

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
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {total === 0
                  ? "No products"
                  : `Showing ${showingFrom}–${showingTo} of ${total} products`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Sheet>
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
                  <div className="mt-6 overflow-y-auto pb-8">{filterPanel}</div>
                </SheetContent>
              </Sheet>

              <Select
                value={filters.sort}
                onValueChange={(value) => {
                  if (!value) return;
                  navigate(
                    {
                      ...filters,
                      sort: value as ProductFilterState["sort"],
                    },
                    1,
                  );
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

          <ActiveFilterChips
            filters={filters}
            onChange={(next) => navigate(next, 1)}
            onClear={handleClearFilters}
          />

          <div className="relative min-h-48" aria-busy={showFilterLoading} aria-live="polite">
            <div
              className={
                showFilterLoading
                  ? "pointer-events-none opacity-40 transition-opacity"
                  : "transition-opacity"
              }
            >
              <ProductGrid products={products} emptyMessage={emptyMessage} />
            </div>
            {showFilterLoading ? (
              <div
                className="absolute inset-0 z-10 flex items-start justify-center pt-16 sm:pt-24"
                role="status"
              >
                <Loader2 className="size-10 animate-spin text-primary" />
                <span className="sr-only">Updating products...</span>
              </div>
            ) : null}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={showFilterLoading || page <= 1}
                onClick={() => navigate(filters, page - 1)}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={showFilterLoading || page >= totalPages}
                onClick={() => navigate(filters, page + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
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
