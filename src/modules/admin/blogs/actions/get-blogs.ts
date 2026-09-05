"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { BLOG_SELECT, mapBlogRow } from "../lib/map-blog";
import { NOT_DELETE } from "../lib/blog-filters";
import type { Blog } from "../types";

export async function getBlogs(): Promise<Blog[]> {
  const { supabase, websiteId } = await requireAdmin();

  const { data, error } = await supabase
    .from("blogs")
    .select(BLOG_SELECT)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapBlogRow);
}
