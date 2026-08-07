"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { NOT_DELETE } from "../lib/category-filters";
import { mapCategoryRow } from "../lib/map-category";
import { parseCategoryName } from "../lib/category-form-schema";

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function createCategory(name: string) {
  const { supabase, websiteId } = await requireAdmin();
  const parsed = parseCategoryName(name);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid category name.",
    );
  }

  const normalized = normalizeCategoryName(parsed.data.name);

  const { data: activeMatch, error: activeError } = await supabase
    .from("categories")
    .select("id")
    .eq("website_id", websiteId)
    .eq("name", normalized)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (activeError) {
    throw new Error(activeError.message);
  }

  if (activeMatch) {
    throw new Error("This category already exists.");
  }

  const { data: deletedMatch, error: deletedError } = await supabase
    .from("categories")
    .select("*")
    .eq("website_id", websiteId)
    .eq("name", normalized)
    .eq("delete", true)
    .maybeSingle();

  if (deletedError) {
    throw new Error(deletedError.message);
  }

  if (deletedMatch) {
    const { data, error } = await supabase
      .from("categories")
      .update({ delete: false })
      .eq("id", deletedMatch.id)
      .eq("website_id", websiteId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePaths();
    return { success: true, category: mapCategoryRow(data) };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      website_id: websiteId,
      name: normalized,
      delete: false,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This category already exists.");
    }
    throw new Error(error.message);
  }

  revalidatePaths();
  return { success: true, category: mapCategoryRow(data) };
}

function revalidatePaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/add");
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}
