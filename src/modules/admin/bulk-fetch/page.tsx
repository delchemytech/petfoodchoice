import { getCategories } from "../categories/actions/get-categories";
import { BulkFetchPageContent } from "./components/bulk-fetch-page-content";

export const dynamic = "force-dynamic";

export default async function BulkFetchPage() {
  const categories = await getCategories();

  return (
    <BulkFetchPageContent
      categories={categories.map((category) => category.name)}
    />
  );
}
