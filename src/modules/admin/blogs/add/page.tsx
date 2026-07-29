import { getBlogCategories } from "@/modules/admin/blog-categories/actions/get-blog-categories";
import { BlogForm } from "../components/blog-form";

export const dynamic = "force-dynamic";

export default async function AddBlogPage() {
  const categories = await getBlogCategories();

  return <BlogForm mode="create" categories={categories} />;
}
