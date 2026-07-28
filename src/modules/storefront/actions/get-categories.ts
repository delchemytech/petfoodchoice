"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { NOT_DELETE } from "@/modules/admin/categories/lib/category-filters";
import {
  getDefaultCategories,
  isCategoriesTableMissing,
} from "@/modules/admin/categories/lib/defaults";
import { mapCategoryRow } from "@/modules/admin/categories/lib/map-category";
import type { Category } from "@/modules/admin/categories/types";
import { sortCategories } from "@/modules/common/lib/category-match";

export async function getStorefrontCategories(): Promise<Category[]> {
  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("delete", NOT_DELETE)
    .order("name", { ascending: true });

  if (error) {
    if (isCategoriesTableMissing(error.message)) {
      return getDefaultCategories();
    }
    if (error.message.includes('"delete"') || error.message.includes("delete")) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return sortCategories((fallbackData ?? []).map(mapCategoryRow));
    }
    throw new Error(error.message);
  }

  return sortCategories((data ?? []).map(mapCategoryRow));
}
