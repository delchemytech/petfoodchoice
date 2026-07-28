export interface StorefrontProduct {
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
}
