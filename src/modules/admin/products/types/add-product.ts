export type AddProductStatus = "active" | "inactive";

export type AffiliateStore =
  | "Amazon"
  | "Flipkart"
  | "Myntra"
  | "Ajio"
  | "Meesho"
  | "Nykaa";

export interface AddProductFormValues {
  affiliateUrl: string;
  imageUrl: string;
  imageUrls: string[];
  name: string;
  brand: string;
  store: AffiliateStore;
  category: string;
  currentPrice: string;
  originalPrice: string;
  discountPercentage: string;
  currency: string;
  rating: string;
  totalReviews: string;
  shortDescription: string;
  status: AddProductStatus;
}

export type FetchProductStatus = "idle" | "loading" | "success" | "error";

export const AFFILIATE_STORES: AffiliateStore[] = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Ajio",
  "Meesho",
  "Nykaa",
];

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
