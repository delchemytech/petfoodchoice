"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { mapProductRow } from "../lib/map-product";
import { NOT_DELETE } from "../lib/product-filters";
import type { Product } from "../types";

export async function getProductById(id: string): Promise<Product | null> {
  const { supabase, websiteId } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProductRow(data) : null;
}
