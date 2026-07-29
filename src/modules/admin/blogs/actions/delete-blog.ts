"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { revalidateBlogPaths } from "../lib/revalidate-blog-paths";
import { NOT_DELETE } from "../lib/blog-filters";

export async function deleteBlog(id: string) {
  const { supabase } = await requireAdmin();

  const { data: blog, error: fetchError } = await supabase
    .from("blogs")
    .select("slug")
    .eq("id", id)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { error } = await supabase
    .from("blogs")
    .update({ delete: true })
    .eq("id", id)
    .eq("delete", NOT_DELETE);

  if (error) {
    throw new Error(error.message);
  }

  revalidateBlogPaths({ slug: blog?.slug, id });

  return { success: true };
}
