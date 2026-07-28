"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { mapStorefrontProduct } from "../lib/map-product";
import { NOT_DELETE } from "@/modules/admin/products/lib/product-filters";
import type { StorefrontProduct } from "../types";

const RECENT_PRODUCTS_LIMIT = 8;

export async function getStorefrontProducts(): Promise<StorefrontProduct[]> {
  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .eq("delete", NOT_DELETE)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapStorefrontProduct);
}

export async function getRecentStorefrontProducts(
  limit = RECENT_PRODUCTS_LIMIT,
): Promise<StorefrontProduct[]> {
  const products = await getStorefrontProducts();
  return products.slice(0, limit);
}
