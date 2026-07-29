import { getBlogCategories } from "./actions/get-blog-categories";
import { BlogCategoriesPageContent } from "./components/blog-categories-page-content";

export const dynamic = "force-dynamic";

export default async function BlogCategoriesPage() {
  const categories = await getBlogCategories();

  return <BlogCategoriesPageContent initialCategories={categories} />;
}
