export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  amazonSourceUrl: string;
  amazonAffiliateUrl: string;
  amazonCurrentPrice: number;
  amazonOriginalPrice: number | null;
  amazonDiscountPercentage: number | null;
  flipkartSourceUrl: string;
  flipkartAffiliateUrl: string;
  flipkartCurrentPrice: number | null;
  flipkartOriginalPrice: number | null;
  flipkartDiscountPercentage: number | null;
  imageUrl: string;
  imageUrls: string[];
  name: string;
  slug: string;
  brand: string;
  category: string;
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
