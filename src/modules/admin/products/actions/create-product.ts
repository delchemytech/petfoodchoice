"use server";

import { AuthError, requireAdmin } from "@/modules/auth/lib/require-admin";
import type { ProductInsert } from "@/modules/common/types/database";
import { getCategoryNames } from "@/modules/admin/categories/actions/get-category-names";
import { fail, succeed, type ProductActionResult } from "../lib/product-action-result";
import { revalidateStorefrontPaths } from "../lib/revalidate-storefront";
import { mapFormToInsert } from "../lib/map-product";
import { parseProductFormValues } from "../lib/product-form-schema";
import type { AddProductFormValues } from "../types/add-product";

export async function createProduct(
  values: AddProductFormValues,
): Promise<ProductActionResult> {
  try {
    const { supabase, websiteId } = await requireAdmin();
    const categoryNames = await getCategoryNames();
    const parsed = parseProductFormValues(values, categoryNames);

    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid product data.");
    }

    const payload: ProductInsert = {
      ...mapFormToInsert(parsed.data),
      website_id: websiteId,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return fail("This URL slug is already in use. Choose a different one.");
      }
      return fail(error.message);
    }

    try {
      revalidateStorefrontPaths({ productId: data.id, slug: data.slug });
    } catch {
      // Save succeeded; cache refresh can be retried on next navigation.
    }

    return succeed(data.id);
  } catch (error) {
    if (error instanceof AuthError) {
      return fail("Admin access required. Sign in again and retry.");
    }

    return fail(
      error instanceof Error
        ? error.message
        : "Failed to save product. Please try again.",
    );
  }
}
