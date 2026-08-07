import { revalidatePath } from "next/cache";

export function revalidateStorefrontPaths(options?: {
  productId?: string;
  slug?: string;
  previousSlug?: string;
}) {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/dashboard");

  if (options?.slug) {
    revalidatePath(`/products/${options.slug}`);
  }

  if (options?.previousSlug && options.previousSlug !== options.slug) {
    revalidatePath(`/products/${options.previousSlug}`);
  }

  if (options?.productId) {
    revalidatePath(`/admin/products/edit/${options.productId}`);
  }
}
