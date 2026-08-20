import { packWeightInKg } from "@/modules/common/lib/product-attribute-options";

export type CatalogFacetOption = { name: string; count: number };

export interface CatalogFacets {
  brands: CatalogFacetOption[];
  petTypes: CatalogFacetOption[];
  lifeStages: CatalogFacetOption[];
  breedSizes: CatalogFacetOption[];
  foodTypes: CatalogFacetOption[];
  flavors: CatalogFacetOption[];
  priceBounds: { min: number; max: number };
  packWeightBounds: { min: number; max: number };
  currency: string;
}

export interface CatalogFacetRow {
  brand: string | null;
  pet_type: string | null;
  life_stage: string | null;
  breed_size: string | null;
  food_type: string | null;
  flavor: string | null;
  pack_weight: number | string | null;
  pack_weight_unit: string | null;
  amazon_current_price: number | string | null;
  flipkart_current_price: number | string | null;
  currency: string | null;
}

export function countFacetValues(
  values: Array<string | null | undefined>,
): CatalogFacetOption[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    const name = value?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map(([name, count]) => ({ name, count }));
}

export function mergeSelectedFacetOptions(
  options: CatalogFacetOption[],
  selected: string[],
): CatalogFacetOption[] {
  if (selected.length === 0) return options;

  const byName = new Map(options.map((option) => [option.name, option]));
  for (const name of selected) {
    const trimmed = name.trim();
    if (!trimmed || byName.has(trimmed)) continue;
    byName.set(trimmed, { name: trimmed, count: 0 });
  }

  return [...byName.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function buildBoundsFromRows(rows: CatalogFacetRow[]): {
  priceBounds: { min: number; max: number };
  packWeightBounds: { min: number; max: number };
  currency: string;
} {
  const prices: number[] = [];
  const weights: number[] = [];

  for (const row of rows) {
    const amazon = toNumber(row.amazon_current_price);
    const flipkart = toNumber(row.flipkart_current_price);
    const listing = [amazon, flipkart].filter(
      (price): price is number => price !== null,
    );
    if (listing.length > 0) {
      prices.push(Math.min(...listing));
    }

    const weight = packWeightInKg(
      toNumber(row.pack_weight),
      row.pack_weight_unit,
    );
    if (weight !== null && weight > 0) {
      weights.push(weight);
    }
  }

  return {
    priceBounds:
      prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : { min: 0, max: 0 },
    packWeightBounds:
      weights.length > 0
        ? { min: Math.min(...weights), max: Math.max(...weights) }
        : { min: 0, max: 20 },
    currency: rows.find((row) => row.currency)?.currency ?? "INR",
  };
}

/** @deprecated Prefer countFacetValues + buildBoundsFromRows for faceted search */
export function buildCatalogFacets(rows: CatalogFacetRow[]): CatalogFacets {
  const bounds = buildBoundsFromRows(rows);
  return {
    brands: countFacetValues(rows.map((row) => row.brand)),
    petTypes: countFacetValues(rows.map((row) => row.pet_type)),
    lifeStages: countFacetValues(rows.map((row) => row.life_stage)),
    breedSizes: countFacetValues(rows.map((row) => row.breed_size)),
    foodTypes: countFacetValues(rows.map((row) => row.food_type)),
    flavors: countFacetValues(rows.map((row) => row.flavor)),
    ...bounds,
  };
}

export const EMPTY_CATALOG_FACETS: CatalogFacets = {
  brands: [],
  petTypes: [],
  lifeStages: [],
  breedSizes: [],
  foodTypes: [],
  flavors: [],
  priceBounds: { min: 0, max: 0 },
  packWeightBounds: { min: 0, max: 20 },
  currency: "INR",
};
