import {
  DEFAULT_PRODUCT_FILTERS,
  type ProductFilterState,
  type ProductSortOption,
} from "./filter-products";

export const CATALOG_PAGE_SIZE = 24;

const SORT_VALUES: ProductSortOption[] = [
  "featured",
  "price-asc",
  "price-desc",
  "rating-desc",
  "discount-desc",
];

function firstParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function csvParam(value: string | string[] | undefined): string[] {
  const raw = firstParam(value);
  if (!raw.trim()) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberParam(value: string | string[] | undefined): number | null {
  const raw = firstParam(value).trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function pageParam(value: string | string[] | undefined): number {
  const parsed = Number.parseInt(firstParam(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseCatalogFilters(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ProductFilterState {
  const get = (key: string) => {
    if (params instanceof URLSearchParams) {
      return params.get(key) ?? undefined;
    }
    return params[key];
  };

  const sortRaw = firstParam(get("sort"));
  const sort = SORT_VALUES.includes(sortRaw as ProductSortOption)
    ? (sortRaw as ProductSortOption)
    : DEFAULT_PRODUCT_FILTERS.sort;

  const category = firstParam(get("category")).trim() || "All";

  return {
    query: firstParam(get("q")).trim(),
    category,
    brands: csvParam(get("brand")),
    petTypes: csvParam(get("petType")),
    lifeStages: csvParam(get("lifeStage")),
    breedSizes: csvParam(get("breedSize")),
    foodTypes: csvParam(get("foodType")),
    flavors: csvParam(get("flavor")),
    minPrice: numberParam(get("minPrice")),
    maxPrice: numberParam(get("maxPrice")),
    minPackWeight: numberParam(get("minKg")),
    maxPackWeight: numberParam(get("maxKg")),
    minRating: numberParam(get("minRating")),
    stores: [],
    onSaleOnly: firstParam(get("sale")) === "1",
    sort,
  };
}

export function parseCatalogPage(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): number {
  if (params instanceof URLSearchParams) {
    return pageParam(params.get("page") ?? undefined);
  }
  return pageParam(params.page);
}

export function serializeCatalogSearchParams(
  filters: ProductFilterState,
  page = 1,
): string {
  const params = new URLSearchParams();

  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category && filters.category !== "All") {
    params.set("category", filters.category);
  }
  if (filters.brands.length) params.set("brand", filters.brands.join(","));
  if (filters.petTypes.length) params.set("petType", filters.petTypes.join(","));
  if (filters.lifeStages.length) {
    params.set("lifeStage", filters.lifeStages.join(","));
  }
  if (filters.breedSizes.length) {
    params.set("breedSize", filters.breedSizes.join(","));
  }
  if (filters.foodTypes.length) params.set("foodType", filters.foodTypes.join(","));
  if (filters.flavors.length) params.set("flavor", filters.flavors.join(","));
  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minPackWeight !== null) {
    params.set("minKg", String(filters.minPackWeight));
  }
  if (filters.maxPackWeight !== null) {
    params.set("maxKg", String(filters.maxPackWeight));
  }
  if (filters.minRating !== null) {
    params.set("minRating", String(filters.minRating));
  }
  if (filters.onSaleOnly) params.set("sale", "1");
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));

  return params.toString();
}

export function catalogHref(filters: ProductFilterState, page = 1): string {
  const query = serializeCatalogSearchParams(filters, page);
  return query ? `/?${query}#picks` : "/#picks";
}
