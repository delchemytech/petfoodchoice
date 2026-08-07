"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { NOT_DELETE } from "../lib/blog-category-filters";

function revalidatePaths() {
  revalidatePath("/admin/blog-categories");
  revalidatePath("/admin/blogs");
  revalidatePath("/blogs");
}

export async function deleteBlogCategory(id: string) {
  const { supabase, websiteId } = await requireAdmin();

  const { data: category, error: categoryError } = await supabase
    .from("blog_categories")
    .select("id, name")
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  if (!category) {
    throw new Error("Blog category not found.");
  }

  const { count, error: blogsError } = await supabase
    .from("blogs")
    .select("id", { count: "exact", head: true })
    .eq("website_id", websiteId)
    .eq("category_id", id)
    .eq("delete", NOT_DELETE);

  if (blogsError) {
    throw new Error(blogsError.message);
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "This category is used by published blogs. Reassign or delete those blogs first.",
    );
  }

  const { error } = await supabase
    .from("blog_categories")
    .update({ delete: true })
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePaths();
  return { success: true };
}
