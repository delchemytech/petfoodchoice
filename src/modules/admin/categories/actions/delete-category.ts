"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { NOT_DELETE } from "../lib/category-filters";
import { mapCategoryRow } from "../lib/map-category";

export async function deleteCategory(id: string) {
  const { supabase, websiteId } = await requireAdmin();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!category) {
    throw new Error("Category not found.");
  }

  const { error } = await supabase
    .from("categories")
    .update({ delete: true })
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/add");
  revalidatePath("/");
  revalidatePath("/admin/dashboard");

  return { success: true };
}
