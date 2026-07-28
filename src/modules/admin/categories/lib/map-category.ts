import type { CategoryRow } from "@/modules/common/types/database";
import type { Category } from "../types";

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}
