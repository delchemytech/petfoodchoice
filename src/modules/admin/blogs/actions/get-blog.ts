"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { BLOG_SELECT, mapBlogRow } from "../lib/map-blog";
import { NOT_DELETE } from "../lib/blog-filters";
import type { Blog } from "../types";

export async function getBlog(id: string): Promise<Blog | null> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("blogs")
    .select(BLOG_SELECT)
    .eq("id", id)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapBlogRow(data) : null;
}
