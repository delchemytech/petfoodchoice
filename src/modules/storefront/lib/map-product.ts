import type { ProductRow } from "@/modules/common/types/database";
import { getDisplayImageUrls } from "@/modules/common/lib/product-images";
import type { StorefrontProduct } from "../types";

export function mapStorefrontProduct(row: ProductRow): StorefrontProduct {
  const imageUrls = getDisplayImageUrls(
    row.image_url ?? "",
    row.image_urls ?? [],
  );

  return {
    id: row.id,
    affiliateUrl: row.affiliate_url,
    imageUrl: imageUrls[0] ?? "",
    imageUrls,
    name: row.name,
    brand: row.brand ?? "",
    store: row.store,
    category: row.category,
    currentPrice: Number(row.current_price),
    originalPrice:
      row.original_price !== null ? Number(row.original_price) : null,
    discountPercentage:
      row.discount_percentage !== null
        ? Number(row.discount_percentage)
        : null,
    currency: row.currency,
    rating: row.rating !== null ? Number(row.rating) : null,
    totalReviews:
      row.total_reviews !== null ? Number(row.total_reviews) : null,
    shortDescription: row.short_description ?? "",
  };
}
