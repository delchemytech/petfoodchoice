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
  const { supabase } = await requireAdmin();
  const categoryNames = await getCategoryNames();
  const parsed = parseProductFormValues(values, categoryNames);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid product data.",
    );
  }

  const payload = mapFormToInsert(parsed.data);

  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .eq("delete", NOT_DELETE);

  if (error) {
    throw new Error(error.message);
  }

  revalidateStorefrontPaths(id);

  return { success: true };
}
