"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { mapFormToUpdate } from "../lib/map-blog";
import { parseBlogFormValues } from "../lib/blog-form-schema";
import { revalidateBlogPaths } from "../lib/revalidate-blog-paths";
import { normalizeBlogValuesForSave } from "../lib/upload-blog-asset";
import { NOT_DELETE } from "../lib/blog-filters";
import type { BlogFormValues } from "../types";

export async function updateBlog(id: string, values: BlogFormValues) {
  const { supabase } = await requireAdmin();
  const parsed = parseBlogFormValues(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blog data.");
  }

  const normalized = await normalizeBlogValuesForSave(supabase, parsed.data);
  const payload = mapFormToUpdate(normalized);

  const { data, error } = await supabase
    .from("blogs")
    .update(payload)
    .eq("id", id)
    .eq("delete", NOT_DELETE)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This URL slug is already in use. Choose a different one.");
    }
    throw new Error(error.message);
  }

  revalidateBlogPaths({ slug: data.slug, id: data.id });

  return { success: true };
}
