import type { Product, ProductStatus } from "../types";
import { matchesCategoryFilter } from "@/modules/common/lib/category-match";
import { getProductStoreLabel } from "../lib/product-display";

export function filterProducts(
  products: Product[],
  query: string,
  status: ProductStatus | "all",
  category: string,
  categories: string[] = [],
): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    const storeLabel = getProductStoreLabel(product);

    const matchesQuery =
      !normalizedQuery ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.brand.toLowerCase().includes(normalizedQuery) ||
      storeLabel.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery);

    const matchesStatus = status === "all" || product.status === status;
    const matchesCategory =
      category === "all" ||
      matchesCategoryFilter(product.category, category, categories);

    return matchesQuery && matchesStatus && matchesCategory;
  });
}
