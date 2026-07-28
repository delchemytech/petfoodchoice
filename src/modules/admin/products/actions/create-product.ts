"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import type { ProductInsert } from "@/modules/common/types/database";
import { getCategoryNames } from "@/modules/admin/categories/actions/get-category-names";
import { revalidateStorefrontPaths } from "../lib/revalidate-storefront";
import { mapFormToInsert } from "../lib/map-product";
import { parseProductFormValues } from "../lib/product-form-schema";
import type { AddProductFormValues } from "../types/add-product";

export async function createProduct(values: AddProductFormValues) {
  const { supabase } = await requireAdmin();
  const categoryNames = await getCategoryNames();
  const parsed = parseProductFormValues(values, categoryNames);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid product data.",
    );
  }

  const payload: ProductInsert = mapFormToInsert(parsed.data);

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateStorefrontPaths(data.id);

  return { success: true, id: data.id };
}
