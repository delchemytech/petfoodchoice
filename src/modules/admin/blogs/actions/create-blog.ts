"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import type { BlogInsert } from "@/modules/common/types/database";
import { mapFormToInsert } from "../lib/map-blog";
import { parseBlogFormValues } from "../lib/blog-form-schema";
import { revalidateBlogPaths } from "../lib/revalidate-blog-paths";
import { normalizeBlogValuesForSave } from "../lib/upload-blog-asset";
import type { BlogFormValues, BlogSaveMode } from "../types";

export async function createBlog(
  values: BlogFormValues,
  _mode: BlogSaveMode = "draft",
) {
  const { supabase } = await requireAdmin();
  const mode: BlogSaveMode = "draft";
  const parsed = parseBlogFormValues(values, mode);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid blog data.");
  }

  const normalized = await normalizeBlogValuesForSave(supabase, parsed.data);
  const payload: BlogInsert = mapFormToInsert(normalized, mode);

  const { data, error } = await supabase
    .from("blogs")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("This URL slug is already in use. Choose a different one.");
    }
    throw new Error(error.message);
  }

  revalidateBlogPaths({ slug: data.slug, id: data.id });

  return { success: true, id: data.id };
}
