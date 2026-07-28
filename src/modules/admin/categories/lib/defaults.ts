import type { Category } from "@/modules/admin/categories/types";

import { OTHERS_CATEGORY_NAME } from "@/modules/common/lib/category-match";

export const DEFAULT_CATEGORIES = ["Food", "Toys", OTHERS_CATEGORY_NAME] as const;

export function getDefaultCategories(): Category[] {
  return DEFAULT_CATEGORIES.map((name, index) => ({
    id: `default-${index}`,
    name,
    createdAt: new Date(0).toISOString(),
  }));
}

export function isCategoriesTableMissing(message: string) {
  return (
    message.includes("categories") &&
    (message.includes("does not exist") ||
      message.includes("schema cache") ||
      message.includes("Could not find"))
  );
}
