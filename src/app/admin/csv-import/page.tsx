import { getCategories } from "@/modules/admin/categories/actions/get-categories";
import { CsvImportPageContent } from "@/modules/admin/csv-import/components/csv-import-page-content";

export const dynamic = "force-dynamic";

export default async function CsvImportPage() {
  const categories = await getCategories();

  return (
    <CsvImportPageContent
      categories={categories.map((category) => category.name)}
    />
  );
}
