"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { getCurrentWebsiteId } from "@/modules/common/lib/website/get-current-website-id";
import { NOT_DELETE } from "@/modules/admin/products/lib/product-filters";
import { mapStorefrontProduct } from "../lib/map-product";
import type { StorefrontProduct } from "../types";

export async function getStorefrontProducts(
  limit?: number,
): Promise<StorefrontProduct[]> {
  const websiteId = await getCurrentWebsiteId();
  if (!websiteId) {
    return [];
  }

  const supabase = createSupabaseAnonServerClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("website_id", websiteId)
    .eq("status", "active")
    .eq("delete", NOT_DELETE)
    .order("created_at", { ascending: false });

  if (limit && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapStorefrontProduct);
}
