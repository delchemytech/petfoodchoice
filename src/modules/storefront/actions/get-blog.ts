"use server";

import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { resolveWebsiteId } from "@/modules/common/lib/website/resolve-website";
import { NOT_DELETE } from "@/modules/admin/blogs/lib/blog-filters";
import {
  mapStorefrontBlog,
  STOREFRONT_BLOG_SELECT,
} from "../lib/map-blog";
import type { StorefrontBlog } from "../types/blog";

export async function getStorefrontBlogBySlug(
  slug: string,
): Promise<StorefrontBlog | null> {
  const supabase = createSupabaseAnonServerClient();
  const websiteId = await resolveWebsiteId(supabase);

  const { data, error } = await supabase
    .from("blogs")
    .select(STOREFRONT_BLOG_SELECT)
    .eq("slug", slug)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapStorefrontBlog(data) : null;
}
