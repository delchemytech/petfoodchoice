import { getCategories } from "../categories/actions/get-categories";
import { getProducts } from "./actions/get-products";
import { ProductsPageContent } from "./components/products-page-content";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductsPageContent
      initialProducts={products}
      categories={categories.map((category) => category.name)}
    />
  );
}
