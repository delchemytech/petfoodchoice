import { matchesCategoryFilter } from "@/modules/common/lib/category-match";
import {
  getListingDiscount,
  getListingPrice,
  hasAmazonOffer,
  hasFlipkartOffer,
} from "./store-offers";
import type { StorefrontProduct } from "../types";
import {
  BREED_SIZE_OPTIONS,
  FLAVOR_SUGGESTIONS,
  FOOD_TYPE_OPTIONS,
  LIFE_STAGE_OPTIONS,
  PACK_WEIGHT_UNIT_OPTIONS,
  PET_TYPE_OPTIONS,
  packWeightInKg,
} from "@/modules/common/lib/product-attribute-options";

export type ProductSortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "discount-desc";

export interface ProductFilterState {
  query: string;
  category: string;
  brands: string[];
  petTypes: string[];
  lifeStages: string[];
  breedSizes: string[];
  foodTypes: string[];
  flavors: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minPackWeight: number | null;
  maxPackWeight: number | null;
  minRating: number | null;
  stores: ("amazon" | "flipkart")[];
  onSaleOnly: boolean;
  sort: ProductSortOption;
}

export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
  query: "",
  category: "All",
  brands: [],
  petTypes: [],
  lifeStages: [],
  breedSizes: [],
  foodTypes: [],
  flavors: [],
  minPrice: null,
  maxPrice: null,
  minPackWeight: null,
  maxPackWeight: null,
  minRating: null,
  stores: [],
  onSaleOnly: false,
  sort: "featured",
};

export const PRODUCT_SORT_OPTIONS: {
  value: ProductSortOption;
  label: string;
}[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Avg. Customer Review" },
  { value: "discount-desc", label: "Discount" },
];

export const RATING_FILTER_OPTIONS = [
  { value: 4, label: "4★ & Up" },
  { value: 3, label: "3★ & Up" },
  { value: 2, label: "2★ & Up" },
] as const;

export function getBrandOptions(products: StorefrontProduct[]) {
  return getAttributeFilterOptions(products, (product) => product.brand);
}

function buildStaticFilterOptions(
  staticOptions: readonly string[],
  products: StorefrontProduct[],
  getter: (product: StorefrontProduct) => string | null,
) {
  const counts = new Map<string, number>();

  for (const product of products) {
    const value = getter(product)?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return staticOptions.map((name) => ({
    name,
    count: counts.get(name) ?? 0,
  }));
}

export function getPetTypeFilterOptions(products: StorefrontProduct[]) {
  return buildStaticFilterOptions(
    PET_TYPE_OPTIONS,
    products,
    (product) => product.petType,
  );
}

export function getLifeStageFilterOptions(products: StorefrontProduct[]) {
  return buildStaticFilterOptions(
    LIFE_STAGE_OPTIONS,
    products,
    (product) => product.lifeStage,
  );
}

export function getBreedSizeFilterOptions(products: StorefrontProduct[]) {
  return buildStaticFilterOptions(
    BREED_SIZE_OPTIONS,
    products,
    (product) => product.breedSize,
  );
}

export function getFoodTypeFilterOptions(products: StorefrontProduct[]) {
  return buildStaticFilterOptions(
    FOOD_TYPE_OPTIONS,
    products,
    (product) => product.foodType,
  );
}

export function getFlavorFilterOptions(products: StorefrontProduct[]) {
  const counts = new Map<string, number>();

  for (const product of products) {
    const value = product.flavor?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const optionNames = new Set<string>([...FLAVOR_SUGGESTIONS, ...counts.keys()]);

  return [...optionNames]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map((name) => ({
      name,
      count: counts.get(name) ?? 0,
    }));
}

/** @deprecated Use getPetTypeFilterOptions */
export function getPetTypeOptions(products: StorefrontProduct[]) {
  return getPetTypeFilterOptions(products);
}

/** @deprecated Use getLifeStageFilterOptions */
export function getLifeStageOptions(products: StorefrontProduct[]) {
  return getLifeStageFilterOptions(products);
}

/** @deprecated Use getBreedSizeFilterOptions */
export function getBreedSizeOptions(products: StorefrontProduct[]) {
  return getBreedSizeFilterOptions(products);
}

/** @deprecated Use getFoodTypeFilterOptions */
export function getFoodTypeOptions(products: StorefrontProduct[]) {
  return getFoodTypeFilterOptions(products);
}

/** @deprecated Use getFlavorFilterOptions */
export function getFlavorOptions(products: StorefrontProduct[]) {
  return getFlavorFilterOptions(products);
}

function getAttributeFilterOptions(
  products: StorefrontProduct[],
  getter: (product: StorefrontProduct) => string | null,
) {
  const counts = new Map<string, number>();

  for (const product of products) {
    const value = getter(product)?.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    .map(([name, count]) => ({ name, count }));
}

export function getPackWeightBounds(products: StorefrontProduct[]) {
  const weights = products
    .map((product) =>
      packWeightInKg(product.packWeight, product.packWeightUnit),
    )
    .filter((weight): weight is number => weight !== null && weight > 0);

  if (weights.length === 0) {
    return { min: 0, max: 20 };
  }

  return {
    min: Math.min(...weights),
    max: Math.max(...weights),
  };
}

export const PACK_WEIGHT_UNIT_FILTER_OPTIONS = PACK_WEIGHT_UNIT_OPTIONS;

export function getPriceBounds(products: StorefrontProduct[]) {
  const prices = products
    .map((product) => getListingPrice(product).currentPrice)
    .filter((price) => price > 0);

  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

function matchesQuery(product: StorefrontProduct, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.shortDescription,
    product.petType,
    product.lifeStage,
    product.breedSize,
    product.foodType,
    product.flavor,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function matchesBrands(product: StorefrontProduct, brands: string[]) {
  if (brands.length === 0) return true;
  return brands.includes(product.brand.trim());
}

function matchesAttributeValues(
  value: string | null,
  selected: string[],
) {
  if (selected.length === 0) return true;
  if (!value?.trim()) return false;
  return selected.includes(value.trim());
}

function matchesPackWeight(
  product: StorefrontProduct,
  minPackWeight: number | null,
  maxPackWeight: number | null,
) {
  if (minPackWeight === null && maxPackWeight === null) return true;

  const weightKg = packWeightInKg(product.packWeight, product.packWeightUnit);
  if (weightKg === null) return false;
  if (minPackWeight !== null && weightKg < minPackWeight) return false;
  if (maxPackWeight !== null && weightKg > maxPackWeight) return false;
  return true;
}

function matchesPrice(
  product: StorefrontProduct,
  minPrice: number | null,
  maxPrice: number | null,
) {
  const { currentPrice } = getListingPrice(product);
  if (currentPrice <= 0) return false;
  if (minPrice !== null && currentPrice < minPrice) return false;
  if (maxPrice !== null && currentPrice > maxPrice) return false;
  return true;
}

function matchesRating(product: StorefrontProduct, minRating: number | null) {
  if (minRating === null) return true;
  if (product.rating === null) return false;
  return product.rating >= minRating;
}

function matchesStores(
  product: StorefrontProduct,
  stores: ("amazon" | "flipkart")[],
) {
  if (stores.length === 0) return true;

  const hasAmazon = hasAmazonOffer(product);
  const hasFlipkart = hasFlipkartOffer(product);

  return stores.some((store) => {
    if (store === "amazon") return hasAmazon;
    return hasFlipkart;
  });
}

function matchesSale(product: StorefrontProduct, onSaleOnly: boolean) {
  if (!onSaleOnly) return true;
  return (getListingDiscount(product) ?? 0) > 0;
}

function sortProducts(
  products: StorefrontProduct[],
  sort: ProductSortOption,
): StorefrontProduct[] {
  const sorted = [...products];

  sorted.sort((left, right) => {
    switch (sort) {
      case "price-asc":
        return (
          getListingPrice(left).currentPrice - getListingPrice(right).currentPrice
        );
      case "price-desc":
        return (
          getListingPrice(right).currentPrice - getListingPrice(left).currentPrice
        );
      case "rating-desc": {
        const leftRating = left.rating ?? -1;
        const rightRating = right.rating ?? -1;
        if (rightRating !== leftRating) return rightRating - leftRating;
        return (right.totalReviews ?? 0) - (left.totalReviews ?? 0);
      }
      case "discount-desc":
        return (
          (getListingDiscount(right) ?? 0) - (getListingDiscount(left) ?? 0)
        );
      case "featured":
      default:
        return 0;
    }
  });

  return sorted;
}

export function filterProducts(
  products: StorefrontProduct[],
  filters: ProductFilterState,
  categoryNames: string[],
) {
  const filtered = products.filter((product) => {
    if (!matchesQuery(product, filters.query)) return false;
    if (
      filters.category !== "All" &&
      !matchesCategoryFilter(
        product.category,
        filters.category,
        categoryNames,
      )
    ) {
      return false;
    }
    if (!matchesBrands(product, filters.brands)) return false;
    if (!matchesAttributeValues(product.petType, filters.petTypes)) return false;
    if (!matchesAttributeValues(product.lifeStage, filters.lifeStages)) {
      return false;
    }
    if (!matchesAttributeValues(product.breedSize, filters.breedSizes)) {
      return false;
    }
    if (!matchesAttributeValues(product.foodType, filters.foodTypes)) {
      return false;
    }
    if (!matchesAttributeValues(product.flavor, filters.flavors)) return false;
    if (!matchesPrice(product, filters.minPrice, filters.maxPrice)) return false;
    if (
      !matchesPackWeight(
        product,
        filters.minPackWeight,
        filters.maxPackWeight,
      )
    ) {
      return false;
    }
    if (!matchesRating(product, filters.minRating)) return false;
    if (!matchesStores(product, filters.stores)) return false;
    if (!matchesSale(product, filters.onSaleOnly)) return false;
    return true;
  });

  return sortProducts(filtered, filters.sort);
}

export function countActiveFilters(filters: ProductFilterState) {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.category !== "All") count += 1;
  if (filters.brands.length > 0) count += 1;
  if (filters.petTypes.length > 0) count += 1;
  if (filters.lifeStages.length > 0) count += 1;
  if (filters.breedSizes.length > 0) count += 1;
  if (filters.foodTypes.length > 0) count += 1;
  if (filters.flavors.length > 0) count += 1;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  if (filters.minPackWeight !== null || filters.maxPackWeight !== null) {
    count += 1;
  }
  if (filters.minRating !== null) count += 1;
  if (filters.onSaleOnly) count += 1;
  return count;
}
