import { revalidatePath } from "next/cache";

export function revalidateStorefrontPaths(productId?: string) {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");

  if (productId) {
    revalidatePath(`/products/${productId}`);
    revalidatePath(`/admin/products/edit/${productId}`);
  }
}
