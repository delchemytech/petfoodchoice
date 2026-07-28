"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { NOT_DELETE } from "@/modules/admin/products/lib/product-filters";
import { mapStorefrontProduct } from "../lib/map-product";
import type { StorefrontProduct } from "../types";

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
