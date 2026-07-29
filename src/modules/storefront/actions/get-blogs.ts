"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { NOT_DELETE } from "@/modules/admin/blogs/lib/blog-filters";
import {
  mapStorefrontBlog,
  STOREFRONT_BLOG_SELECT,
} from "../lib/map-blog";
import type { StorefrontBlog } from "../types/blog";

export async function getStorefrontBlogs(): Promise<StorefrontBlog[]> {
  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(STOREFRONT_BLOG_SELECT)
    .eq("delete", NOT_DELETE)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapStorefrontBlog);
}
