"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { NOT_DELETE } from "../lib/blog-category-filters";
import { mapBlogCategoryRow, sortBlogCategories } from "../lib/map-blog-category";
import type { BlogCategory } from "../types";

export async function getBlogCategories(): Promise<BlogCategory[]> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("delete", NOT_DELETE)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return sortBlogCategories((data ?? []).map(mapBlogCategoryRow));
}
