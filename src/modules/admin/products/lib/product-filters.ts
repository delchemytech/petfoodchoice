import type { ProductStatus } from "../types";

export const NOT_DELETE = false;

export function isActiveProduct(status: ProductStatus, isDeleted: boolean) {
  return status === "active" && !isDeleted;
}
