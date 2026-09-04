"use client";

import { Check } from "lucide-react";
import { useCompare } from "../lib/compare-context";
import type { StorefrontProduct } from "../types";

interface CompareToggleButtonProps {
  product: StorefrontProduct;
}

export function CompareToggleButton({ product }: CompareToggleButtonProps) {
  const { compareMode, toggle, isSelected, isFull } = useCompare();
  const selected = isSelected(product.id);

  // Only show when compare mode is active
  if (!compareMode) return null;

  const disabled = !selected && isFull;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          toggle(product);
        }
      }}
      disabled={disabled}
      className={`absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-md"
          : disabled
            ? "border-border/50 bg-background/60 cursor-not-allowed"
            : "border-border bg-background/90 hover:border-primary hover:shadow-md"
      }`}
      aria-label={
        selected
          ? `Remove ${product.name} from comparison`
          : `Add ${product.name} to comparison`
      }
      title={
        disabled
          ? "Remove a product first to compare this one"
          : selected
            ? "Remove from comparison"
            : "Add to comparison"
      }
    >
      {selected ? <Check className="size-4" strokeWidth={3} /> : null}
    </button>
  );
}
