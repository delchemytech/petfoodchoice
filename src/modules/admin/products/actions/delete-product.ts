"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/modules/auth/lib/require-admin";
import { NOT_DELETE } from "../lib/product-filters";

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("products")
    .update({
      delete: true,
      status: "inactive",
    })
    .eq("id", id)
    .eq("delete", NOT_DELETE);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");

  return { success: true };
}
