import type { BlogCategoryRow } from "@/modules/common/types/database";
import type { BlogCategory } from "../types";

export function mapBlogCategoryRow(row: BlogCategoryRow): BlogCategory {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function sortBlogCategories(categories: BlogCategory[]) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}
