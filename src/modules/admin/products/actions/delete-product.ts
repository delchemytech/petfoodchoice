"use server";

import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { revalidateStorefrontPaths } from "../lib/revalidate-storefront";
import { NOT_DELETE } from "../lib/product-filters";

export async function deleteProduct(id: string) {
  const { supabase, websiteId } = await requireAdmin();

  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { error } = await supabase
    .from("products")
    .update({
      delete: true,
      status: "inactive",
    })
    .eq("id", id)
    .eq("website_id", websiteId)
    .eq("delete", NOT_DELETE);

  if (error) {
    throw new Error(error.message);
  }

  revalidateStorefrontPaths({ productId: id, slug: product?.slug });

  return { success: true };
}
