"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { NOT_DELETE } from "@/modules/admin/products/lib/product-filters";
import { mapStorefrontProduct } from "../lib/map-product";
import type { StorefrontProduct } from "../types";
import type { ProductStatus } from "@/modules/common/types/database";

export interface StorefrontProductPreview {
  product: StorefrontProduct;
  status: ProductStatus;
}

export async function getStorefrontProductById(
  id: string,
): Promise<StorefrontProduct | null> {
  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapStorefrontProduct(data) : null;
}

export async function getStorefrontProductPreviewById(
  id: string,
): Promise<StorefrontProductPreview | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    product: mapStorefrontProduct(data),
    status: data.status,
  };
}
