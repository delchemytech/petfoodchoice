"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { getCurrentWebsiteId } from "@/modules/common/lib/website/get-current-website-id";
import { NOT_DELETE } from "@/modules/admin/products/lib/product-filters";
import { mapStorefrontProduct } from "../lib/map-product";
import type { StorefrontProduct } from "../types";
import type { ProductStatus } from "@/modules/common/types/database";

export interface StorefrontProductPreview {
  product: StorefrontProduct;
  status: ProductStatus;
}

export async function getStorefrontProductBySlug(
  slug: string,
): Promise<StorefrontProduct | null> {
  const websiteId = await getCurrentWebsiteId();
  if (!websiteId) {
    return null;
  }

  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("website_id", websiteId)
    .eq("status", "active")
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapStorefrontProduct(data) : null;
}

export async function getStorefrontProductPreviewBySlug(
  slug: string,
): Promise<StorefrontProductPreview | null> {
  const { supabase, websiteId } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("website_id", websiteId)
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
