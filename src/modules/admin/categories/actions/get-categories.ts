"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { NOT_DELETE } from "../lib/category-filters";
import { mapCategoryRow } from "../lib/map-category";
import { getDefaultCategories, isCategoriesTableMissing } from "../lib/defaults";
import { sortCategories } from "@/modules/common/lib/category-match";
import type { Category } from "../types";

export async function getCategories(): Promise<Category[]> {
  const { supabase } = await requireAdmin();

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
