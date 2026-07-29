import { revalidatePath } from "next/cache";

export function revalidateBlogPaths(options?: { slug?: string; id?: string }) {
  revalidatePath("/blogs");
  revalidatePath("/admin/blogs");
  revalidatePath("/admin/blog-categories");

  if (options?.slug) {
    revalidatePath(`/blogs/${options.slug}`);
  }

  if (options?.id) {
    revalidatePath(`/admin/blogs/edit/${options.id}`);
  }
}
