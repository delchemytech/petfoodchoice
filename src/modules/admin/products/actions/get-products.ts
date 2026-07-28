"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { mapProductRow } from "../lib/map-product";
import { NOT_DELETE } from "../lib/product-filters";
import type { Product } from "../types";

export async function getProducts(): Promise<Product[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("delete", NOT_DELETE)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProductRow);
}
