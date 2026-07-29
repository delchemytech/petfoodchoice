"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { NOT_DELETE } from "@/modules/admin/blog-categories/lib/blog-category-filters";
import { mapStorefrontBlogCategory } from "../lib/map-blog";
import type { StorefrontBlogCategory } from "../types/blog";

export async function getStorefrontBlogCategories(): Promise<
  StorefrontBlogCategory[]
> {
  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("delete", NOT_DELETE)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapStorefrontBlogCategory);
}
