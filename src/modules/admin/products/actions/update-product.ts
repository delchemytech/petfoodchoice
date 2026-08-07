"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { getCategoryNames } from "@/modules/admin/categories/actions/get-category-names";
import { revalidateStorefrontPaths } from "../lib/revalidate-storefront";
import { mapFormToInsert } from "../lib/map-product";
import { NOT_DELETE } from "../lib/product-filters";
import { parseProductFormValues } from "../lib/product-form-schema";
import type { AddProductFormValues } from "../types/add-product";

export async function updateProduct(
  id: string,
  values: AddProductFormValues,
) {
  const { supabase, websiteId } = await requireAdmin();
  const categoryNames = await getCategoryNames();
  const parsed = parseProductFormValues(values, categoryNames);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid product data.",
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existing) {
    throw new Error("Product not found.");
  }

  const payload = mapFormToInsert(parsed.data);

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "This URL slug is already in use. Choose a different one.",
      );
    }
    throw new Error(error.message);
  }

  revalidateStorefrontPaths({
    productId: data.id,
    slug: data.slug,
    previousSlug: existing.slug,
  });

  return { success: true };
}
