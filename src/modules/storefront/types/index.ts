import type { ProductAttributes } from "@/modules/common/types/product-attributes";

export interface StorefrontProduct extends ProductAttributes {
  id: string;
  amazonAffiliateUrl: string;
  amazonCurrentPrice: number | null;
  amazonOriginalPrice: number | null;
  amazonDiscountPercentage: number | null;
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
  currentPrice: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  currency: string;
  rating: number | null;
  totalReviews: number | null;
  shortDescription: string;
}
