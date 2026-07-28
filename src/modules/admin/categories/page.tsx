import { getCategories } from "./actions/get-categories";
import { CategoriesPageContent } from "./components/categories-page-content";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoriesPageContent initialCategories={categories} />;
}
