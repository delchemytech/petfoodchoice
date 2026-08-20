"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { getCurrentWebsiteId } from "@/modules/common/lib/website/get-current-website-id";
import { NOT_DELETE } from "@/modules/admin/products/lib/product-filters";
import {
  applyCatalogFilters,
  applyCatalogSort,
  type CatalogFilterOmitKey,
} from "../lib/apply-catalog-filters";
import {
  buildBoundsFromRows,
  countFacetValues,
  EMPTY_CATALOG_FACETS,
  mergeSelectedFacetOptions,
  type CatalogFacetOption,
  type CatalogFacetRow,
  type CatalogFacets,
} from "../lib/catalog-facets";
import { CATALOG_PAGE_SIZE } from "../lib/catalog-search-params";
import type { ProductFilterState } from "../lib/filter-products";
import { mapStorefrontProduct } from "../lib/map-product";
import type { StorefrontProduct } from "../types";

const BOUNDS_COLUMNS =
  "pack_weight, pack_weight_unit, amazon_current_price, flipkart_current_price, currency";

export interface StorefrontCatalogResult {
  products: StorefrontProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function emptyCatalogResult(page: number): StorefrontCatalogResult {
  return {
    products: [],
    total: 0,
    page,
    pageSize: CATALOG_PAGE_SIZE,
    totalPages: 0,
  };
}

function baseProductQuery(websiteId: string) {
  const supabase = createSupabaseAnonServerClient();
  return supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("website_id", websiteId)
    .eq("status", "active")
    .eq("delete", NOT_DELETE);
}

async function countFacetColumn(
  websiteId: string,
  filters: ProductFilterState,
  categoryNames: string[],
  column: string,
  omit: CatalogFilterOmitKey,
  selected: string[],
): Promise<CatalogFacetOption[]> {
  const supabase = createSupabaseAnonServerClient();

  let query: any = supabase
    .from("products")
    .select(column)
    .eq("website_id", websiteId)
    .eq("status", "active")
    .eq("delete", NOT_DELETE);

  query = applyCatalogFilters(query, filters, categoryNames, [omit]);

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const options = countFacetValues(
    ((data ?? []) as Array<Record<string, string | null>>).map(
      (row) => row[column] ?? null,
    ),
  );

  return mergeSelectedFacetOptions(options, selected);
}

export async function getStorefrontProductsFiltered(
  filters: ProductFilterState,
  categoryNames: string[],
  page = 1,
): Promise<StorefrontCatalogResult> {
  const websiteId = await getCurrentWebsiteId();
  if (!websiteId) {
    return emptyCatalogResult(page);
  }

  const safePage = Math.max(1, page);
  const from = (safePage - 1) * CATALOG_PAGE_SIZE;
  const to = from + CATALOG_PAGE_SIZE - 1;

  let query: any = baseProductQuery(websiteId);
  query = applyCatalogFilters(query, filters, categoryNames);
  query = applyCatalogSort(query, filters.sort);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;

  return {
    products: (data ?? []).map(mapStorefrontProduct),
    total,
    page: safePage,
    pageSize: CATALOG_PAGE_SIZE,
    totalPages: Math.ceil(total / CATALOG_PAGE_SIZE),
  };
}

export async function getStorefrontFilterFacets(
  filters: ProductFilterState = {
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
  },
  categoryNames: string[] = [],
): Promise<CatalogFacets> {
  const websiteId = await getCurrentWebsiteId();
  if (!websiteId) {
    return EMPTY_CATALOG_FACETS;
  }

  const supabase = createSupabaseAnonServerClient();

  const [
    brands,
    petTypes,
    lifeStages,
    breedSizes,
    foodTypes,
    flavors,
    boundsResult,
  ] = await Promise.all([
    countFacetColumn(
      websiteId,
      filters,
      categoryNames,
      "brand",
      "brands",
      filters.brands,
    ),
    countFacetColumn(
      websiteId,
      filters,
      categoryNames,
      "pet_type",
      "petTypes",
      filters.petTypes,
    ),
    countFacetColumn(
      websiteId,
      filters,
      categoryNames,
      "life_stage",
      "lifeStages",
      filters.lifeStages,
    ),
    countFacetColumn(
      websiteId,
      filters,
      categoryNames,
      "breed_size",
      "breedSizes",
      filters.breedSizes,
    ),
    countFacetColumn(
      websiteId,
      filters,
      categoryNames,
      "food_type",
      "foodTypes",
      filters.foodTypes,
    ),
    countFacetColumn(
      websiteId,
      filters,
      categoryNames,
      "flavor",
      "flavors",
      filters.flavors,
    ),
    supabase
      .from("products")
      .select(BOUNDS_COLUMNS)
      .eq("website_id", websiteId)
      .eq("status", "active")
      .eq("delete", NOT_DELETE),
  ]);

  if (boundsResult.error) {
    throw new Error(boundsResult.error.message);
  }

  const bounds = buildBoundsFromRows(
    (boundsResult.data ?? []) as CatalogFacetRow[],
  );

  return {
    brands,
    petTypes,
    lifeStages,
    breedSizes,
    foodTypes,
    flavors,
    ...bounds,
  };
}
