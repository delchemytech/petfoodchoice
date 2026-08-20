"use client";

import { X } from "lucide-react";
import type { ProductFilterState } from "../lib/filter-products";

interface ActiveFilterChipsProps {
  filters: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  onClear: () => void;
}

type Chip = {
  key: string;
  label: string;
  clear: (current: ProductFilterState) => ProductFilterState;
};

function buildChips(filters: ProductFilterState): Chip[] {
  const chips: Chip[] = [];

  if (filters.query.trim()) {
    chips.push({
      key: "q",
      label: `Search: ${filters.query.trim()}`,
      clear: (current) => ({ ...current, query: "" }),
    });
  }

  if (filters.category !== "All") {
    chips.push({
      key: "category",
      label: `Category: ${filters.category}`,
      clear: (current) => ({ ...current, category: "All" }),
    });
  }

  for (const brand of filters.brands) {
    chips.push({
      key: `brand-${brand}`,
      label: `Brand: ${brand}`,
      clear: (current) => ({
        ...current,
        brands: current.brands.filter((item) => item !== brand),
      }),
    });
  }

  for (const value of filters.petTypes) {
    chips.push({
      key: `pet-${value}`,
      label: `Pet: ${value}`,
      clear: (current) => ({
        ...current,
        petTypes: current.petTypes.filter((item) => item !== value),
      }),
    });
  }

  for (const value of filters.lifeStages) {
    chips.push({
      key: `life-${value}`,
      label: `Life stage: ${value}`,
      clear: (current) => ({
        ...current,
        lifeStages: current.lifeStages.filter((item) => item !== value),
      }),
    });
  }

  for (const value of filters.breedSizes) {
    chips.push({
      key: `breed-${value}`,
      label: `Breed: ${value}`,
      clear: (current) => ({
        ...current,
        breedSizes: current.breedSizes.filter((item) => item !== value),
      }),
    });
  }

  for (const value of filters.foodTypes) {
    chips.push({
      key: `food-${value}`,
      label: `Food: ${value}`,
      clear: (current) => ({
        ...current,
        foodTypes: current.foodTypes.filter((item) => item !== value),
      }),
    });
  }

  for (const value of filters.flavors) {
    chips.push({
      key: `flavor-${value}`,
      label: `Flavor: ${value}`,
      clear: (current) => ({
        ...current,
        flavors: current.flavors.filter((item) => item !== value),
      }),
    });
  }

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const min = filters.minPrice ?? "…";
    const max = filters.maxPrice ?? "…";
    chips.push({
      key: "price",
      label: `Price: ${min}–${max}`,
      clear: (current) => ({
        ...current,
        minPrice: null,
        maxPrice: null,
      }),
    });
  }

  if (filters.minPackWeight !== null || filters.maxPackWeight !== null) {
    const min = filters.minPackWeight ?? "…";
    const max = filters.maxPackWeight ?? "…";
    chips.push({
      key: "pack",
      label: `Pack: ${min}–${max} kg`,
      clear: (current) => ({
        ...current,
        minPackWeight: null,
        maxPackWeight: null,
      }),
    });
  }

  if (filters.minRating !== null) {
    chips.push({
      key: "rating",
      label: `${filters.minRating}★ & up`,
      clear: (current) => ({ ...current, minRating: null }),
    });
  }

  if (filters.onSaleOnly) {
    chips.push({
      key: "sale",
      label: "On sale",
      clear: (current) => ({ ...current, onSaleOnly: false }),
    });
  }

  return chips;
}

export function ActiveFilterChips({
  filters,
  onChange,
  onClear,
}: ActiveFilterChipsProps) {
  const chips = buildChips(filters);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.clear(filters))}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {chip.label}
          <X className="size-3.5 text-muted-foreground" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-medium text-primary hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
