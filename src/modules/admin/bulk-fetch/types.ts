import type { AddProductFormValues } from "@/modules/admin/products/types/add-product";

export type BulkFetchedProduct = AddProductFormValues & {
  asin: string;
};

export type SearchPageResult = {
  products: BulkFetchedProduct[];
  hasNext: boolean;
  blocked: boolean;
  page: number;
};

export type ProductDetailResult = {
  product: BulkFetchedProduct | null;
  blocked: boolean;
};

export type SaveBulkProductsResult =
  | {
      success: true;
      saved: number;
      skippedExisting: number;
      skippedInvalid: number;
    }
  | { success: false; error: string };
