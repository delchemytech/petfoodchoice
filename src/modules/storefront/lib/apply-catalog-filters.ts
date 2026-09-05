import { isOthersCategory } from "@/modules/common/lib/category-match";
import type { ProductFilterState, ProductSortOption } from "./filter-products";

type FilterQuery = {
  eq: (column: string, value: unknown) => FilterQuery;
  or: (filters: string) => FilterQuery;
  in: (column: string, values: string[]) => FilterQuery;
  ilike: (column: string, value: string) => FilterQuery;
  gte: (column: string, value: number) => FilterQuery;
  not: (column: string, operator: string, value: string) => FilterQuery;
  order: (
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ) => FilterQuery;
};

function escapeIlike(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")
    .replaceAll(",", " ");
}

function applyIn(query: FilterQuery, column: string, values: string[]) {
  if (values.length === 0) return query;
  return query.in(column, values);
}

function applyPriceRange(
  query: FilterQuery,
  minPrice: number | null,
  maxPrice: number | null,
) {
  let next = query;

  if (minPrice !== null) {
    next = next.or(
      `amazon_current_price.gte.${minPrice},flipkart_current_price.gte.${minPrice}`,
    );
  }

  if (maxPrice !== null) {
    next = next.or(
      `amazon_current_price.lte.${maxPrice},flipkart_current_price.lte.${maxPrice}`,
    );
  }

  return next;
}

function applyPackWeightRange(
  query: FilterQuery,
  minPackWeight: number | null,
  maxPackWeight: number | null,
) {
  if (minPackWeight === null && maxPackWeight === null) return query;

  const clauses: string[] = [];
  const units = [
    { unit: "kg", multiplier: 1 },
    { unit: "g", multiplier: 1000 },
  ] as const;

  for (const { unit, multiplier } of units) {
    const parts = [`pack_weight_unit.eq.${unit}`];
    if (minPackWeight !== null) {
      parts.push(`pack_weight.gte.${minPackWeight * multiplier}`);
    }
    if (maxPackWeight !== null) {
      parts.push(`pack_weight.lte.${maxPackWeight * multiplier}`);
    }
    clauses.push(`and(${parts.join(",")})`);
  }

  const unknownUnitParts = ["pack_weight_unit.is.null"];
  if (minPackWeight !== null) {
    unknownUnitParts.push(`pack_weight.gte.${minPackWeight}`);
  }
  if (maxPackWeight !== null) {
    unknownUnitParts.push(`pack_weight.lte.${maxPackWeight}`);
  }
  clauses.push(`and(${unknownUnitParts.join(",")})`);

  return query.or(clauses.join(","));
}

export type CatalogFilterOmitKey =
  | "query"
  | "category"
  | "brands"
  | "petTypes"
  | "lifeStages"
  | "breedSizes"
  | "foodTypes"
  | "flavors"
  | "price"
  | "packWeight"
  | "minRating"
  | "onSaleOnly";

export function applyCatalogFilters(
  query: FilterQuery,
  filters: ProductFilterState,
  categoryNames: string[],
  omit: CatalogFilterOmitKey[] = [],
) {
  const shouldApply = (key: CatalogFilterOmitKey) => !omit.includes(key);
  let next = query;

  const search = filters.query.trim();
  if (shouldApply("query") && search) {
    const q = escapeIlike(search);
    next = next.or(
      [
        `name.ilike.%${q}%`,
        `brand.ilike.%${q}%`,
        `category.ilike.%${q}%`,
        `short_description.ilike.%${q}%`,
        `flavor.ilike.%${q}%`,
        `pet_type.ilike.%${q}%`,
        `food_type.ilike.%${q}%`,
        `life_stage.ilike.%${q}%`,
      ].join(","),
    );
  }

  if (shouldApply("category") && filters.category !== "All") {
    if (isOthersCategory(filters.category)) {
      const primary = categoryNames
        .filter((category) => !isOthersCategory(category))
        .map((category) => `"${category.replaceAll('"', "")}"`)
        .join(",");
      if (primary) {
        next = next.not("category", "in", `(${primary})`);
      }
    } else {
      next = next.ilike("category", filters.category);
    }
  }

  if (shouldApply("brands")) {
    next = applyIn(next, "brand", filters.brands);
  }
  if (shouldApply("petTypes")) {
    next = applyIn(next, "pet_type", filters.petTypes);
  }
  if (shouldApply("lifeStages")) {
    next = applyIn(next, "life_stage", filters.lifeStages);
  }
  if (shouldApply("breedSizes")) {
    next = applyIn(next, "breed_size", filters.breedSizes);
  }
  if (shouldApply("foodTypes")) {
    next = applyIn(next, "food_type", filters.foodTypes);
  }
  if (shouldApply("flavors")) {
    next = applyIn(next, "flavor", filters.flavors);
  }
  if (shouldApply("price")) {
    next = applyPriceRange(next, filters.minPrice, filters.maxPrice);
  }
  if (shouldApply("packWeight")) {
    next = applyPackWeightRange(
      next,
      filters.minPackWeight,
      filters.maxPackWeight,
    );
  }

  if (shouldApply("minRating") && filters.minRating !== null) {
    next = next.gte("rating", filters.minRating);
  }

  if (shouldApply("onSaleOnly") && filters.onSaleOnly) {
    next = next.or(
      "amazon_discount_percentage.gt.0,flipkart_discount_percentage.gt.0",
    );
  }

  return next;
}

export function applyCatalogSort(query: FilterQuery, sort: ProductSortOption) {
  switch (sort) {
    case "price-asc":
      return query.order("amazon_current_price", {
        ascending: true,
        nullsFirst: false,
      });
    case "price-desc":
      return query.order("amazon_current_price", {
        ascending: false,
        nullsFirst: false,
      });
    case "rating-desc":
      return query
        .order("rating", { ascending: false, nullsFirst: false })
        .order("total_reviews", { ascending: false, nullsFirst: false });
    case "discount-desc":
      return query.order("amazon_discount_percentage", {
        ascending: false,
        nullsFirst: false,
      });
    case "featured":
    default:
      return query
        .order("rating", { ascending: false, nullsFirst: false })
        .order("total_reviews", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
  }
}
