"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { NOT_DELETE } from "../lib/blog-category-filters";
import { mapBlogCategoryRow } from "../lib/map-blog-category";
import { parseBlogCategoryName } from "../lib/blog-category-form-schema";

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function revalidatePaths() {
  revalidatePath("/admin/blog-categories");
  revalidatePath("/admin/blogs");
  revalidatePath("/admin/blogs/add");
  revalidatePath("/blogs");
}

export async function createBlogCategory(name: string) {
  const { supabase, websiteId } = await requireAdmin();
  const parsed = parseBlogCategoryName(name);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid category name.",
    );
  }

  const normalized = normalizeName(parsed.data.name);

  const { data: activeMatch, error: activeError } = await supabase
    .from("blog_categories")
    .select("id")
    .eq("website_id", websiteId)
    .eq("name", normalized)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (activeError) {
    throw new Error(activeError.message);
  }

  if (activeMatch) {
    throw new Error("This blog category already exists.");
  }

  const { data: deletedMatch, error: deletedError } = await supabase
    .from("blog_categories")
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
      .from("blog_categories")
      .update({ delete: false })
      .eq("id", deletedMatch.id)
      .eq("website_id", websiteId)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePaths();
    return { success: true, category: mapBlogCategoryRow(data) };
  }

  const { data, error } = await supabase
    .from("blog_categories")
    .insert({
      website_id: websiteId,
      name: normalized,
      delete: false,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This blog category already exists.");
    }
    throw new Error(error.message);
  }

  revalidatePaths();
  return { success: true, category: mapBlogCategoryRow(data) };
}
