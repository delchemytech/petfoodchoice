"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Scale, ShoppingBag } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import { useCompare } from "../lib/compare-context";
import type { StorefrontProduct } from "../types";
import { CompareTable } from "./compare-table";

export function ComparePageContent() {
  const { selectedProducts, remove, clearAll } = useCompare();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  // Not enough products — empty state
  if (selectedProducts.length < 2 && !navigating) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Scale className="size-10" />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Compare products
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              Select two products from the catalog to see a detailed side-by-side
              comparison of prices, ratings, and specifications.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="rounded-full"
              render={<Link href="/#picks" />}
            >
              <ShoppingBag data-icon="inline-start" />
              Browse products
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              render={<Link href="/" />}
            >
              Go to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function handleRemove(id: string) {
    remove(id);
  }

  function handleBrowseMore() {
    setNavigating(true);
    setTimeout(() => {
      clearAll();
      router.push("/#picks");
    }, 2000);
  }

  // Loading overlay while navigating
  if (navigating) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Taking you to the shop…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Product comparison
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Compare products
            </h1>
            <p className="text-sm text-muted-foreground">
              Side-by-side breakdown to help you pick the right product
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={clearAll}
          >
            Clear comparison
          </Button>
        </div>
      </div>

      {/* Comparison content */}
      <CompareTable
        products={selectedProducts as [StorefrontProduct, StorefrontProduct]}
        onRemove={handleRemove}
      />

      {/* Bottom CTA */}
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border/80 bg-muted/20 px-6 py-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Want to compare different products?
        </p>
        <Button className="rounded-full" onClick={handleBrowseMore}>
          <ShoppingBag data-icon="inline-start" />
          Browse more products
        </Button>
      </div>
    </div>
  );
}

