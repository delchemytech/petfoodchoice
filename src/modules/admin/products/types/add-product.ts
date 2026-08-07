export type AddProductStatus = "active" | "inactive";

export interface AddProductFormValues {
  amazonSourceUrl: string;
  amazonAffiliateUrl: string;
  amazonCurrentPrice: string;
  amazonOriginalPrice: string;
  amazonDiscountPercentage: string;
  flipkartSourceUrl: string;
  flipkartAffiliateUrl: string;
  flipkartCurrentPrice: string;
  flipkartOriginalPrice: string;
  flipkartDiscountPercentage: string;
  imageUrl: string;
  imageUrls: string[];
  name: string;
  slug: string;
  brand: string;
  category: string;
  currency: string;
  rating: string;
  totalReviews: string;
  shortDescription: string;
  status: AddProductStatus;
}

export type FetchProductStatus = "idle" | "loading" | "success" | "error";

export const ADD_PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Health & Beauty",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Grocery",
] as const;

export const CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;

export const ADD_PRODUCT_STATUSES: AddProductStatus[] = ["active", "inactive"];
