"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { sortCategoryNames } from "@/modules/common/lib/category-match";
import { NOT_DELETE } from "../lib/category-filters";
import { getDefaultCategories, isCategoriesTableMissing } from "../lib/defaults";

export async function getCategoryNames(): Promise<string[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("delete", NOT_DELETE)
    .order("name", { ascending: true });

  if (error) {
    if (isCategoriesTableMissing(error.message)) {
      return getDefaultCategories().map((category) => category.name);
    }

    throw new Error(error.message);
  }

  return sortCategoryNames((data ?? []).map((row) => row.name));
}
