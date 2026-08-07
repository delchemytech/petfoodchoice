import type { ProductRow } from "@/modules/common/types/database";
import { getDisplayImageUrls } from "@/modules/common/lib/product-images";
import type { StorefrontProduct } from "../types";
import { getListingDiscount, getListingPrice } from "./store-offers";

export function mapStorefrontProduct(row: ProductRow): StorefrontProduct {
  const imageUrls = getDisplayImageUrls(
    row.image_url ?? "",
    row.image_urls ?? [],
  );

  const amazonAffiliateUrl = row.amazon_affiliate_url ?? "";
  const amazonCurrentPrice =
    row.amazon_current_price !== null
      ? Number(row.amazon_current_price)
      : null;
  const amazonOriginalPrice =
    row.amazon_original_price !== null
      ? Number(row.amazon_original_price)
      : null;
  const amazonDiscountPercentage =
    row.amazon_discount_percentage !== null
      ? Number(row.amazon_discount_percentage)
      : null;
  const flipkartAffiliateUrl = row.flipkart_affiliate_url ?? "";
  const flipkartCurrentPrice =
    row.flipkart_current_price !== null
      ? Number(row.flipkart_current_price)
      : null;
  const flipkartOriginalPrice =
    row.flipkart_original_price !== null
      ? Number(row.flipkart_original_price)
      : null;
  const flipkartDiscountPercentage =
    row.flipkart_discount_percentage !== null
      ? Number(row.flipkart_discount_percentage)
      : null;

  const product: StorefrontProduct = {
    id: row.id,
    amazonAffiliateUrl,
    amazonCurrentPrice,
    amazonOriginalPrice,
    amazonDiscountPercentage,
    flipkartAffiliateUrl,
    flipkartCurrentPrice,
    flipkartOriginalPrice,
    flipkartDiscountPercentage,
    imageUrl: imageUrls[0] ?? "",
    imageUrls,
    name: row.name,
    slug: row.slug,
    brand: row.brand ?? "",
    category: row.category,
    currentPrice: 0,
    originalPrice: null,
    discountPercentage: null,
    currency: row.currency,
    rating: row.rating !== null ? Number(row.rating) : null,
    totalReviews:
      row.total_reviews !== null ? Number(row.total_reviews) : null,
    shortDescription: row.short_description ?? "",
  };

  const listing = getListingPrice(product);
  product.currentPrice = listing.currentPrice;
  product.originalPrice = listing.originalPrice;
  product.discountPercentage = getListingDiscount(product);

  return product;
}
