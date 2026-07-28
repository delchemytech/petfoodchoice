export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  affiliateUrl: string;
  imageUrl: string;
  imageUrls: string[];
  name: string;
  brand: string;
  store: string;
  category: string;
  currentPrice: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  currency: string;
  rating: number | null;
  totalReviews: number | null;
  shortDescription: string;
  status: ProductStatus;
  delete: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Health & Beauty",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Grocery",
] as const;

export const PRODUCT_STATUSES: ProductStatus[] = ["active", "inactive"];
