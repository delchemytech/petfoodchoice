import type { StorefrontProduct } from "../types";

export function getListingPrice(product: StorefrontProduct) {
  const prices = [
    product.amazonCurrentPrice,
    product.flipkartCurrentPrice,
  ].filter((price): price is number => price !== null && price > 0);

  if (prices.length === 0) {
    return {
      currentPrice: 0,
      originalPrice: null as number | null,
    };
  }

  const currentPrice = Math.min(...prices);

  const originalCandidates = [
    product.amazonOriginalPrice !== null &&
    product.amazonCurrentPrice !== null &&
    product.amazonOriginalPrice > product.amazonCurrentPrice
      ? product.amazonOriginalPrice
      : null,
    product.flipkartOriginalPrice !== null &&
    product.flipkartCurrentPrice !== null &&
    product.flipkartOriginalPrice > product.flipkartCurrentPrice
      ? product.flipkartOriginalPrice
      : null,
  ].filter((price): price is number => price !== null);

  const originalPrice =
    originalCandidates.length > 0 ? Math.max(...originalCandidates) : null;

  return { currentPrice, originalPrice };
}

export function getPrimaryBuyUrl(product: StorefrontProduct): string | null {
  if (product.amazonAffiliateUrl.trim()) {
    return product.amazonAffiliateUrl.trim();
  }
  if (product.flipkartAffiliateUrl.trim()) {
    return product.flipkartAffiliateUrl.trim();
  }
  return null;
}

export function getProductBadgeLabel(product: StorefrontProduct): string {
  const parts = [product.brand, product.category].filter(Boolean);
  return parts.join(" · ") || product.category || "Pet essentials";
}

export function hasAmazonOffer(product: StorefrontProduct) {
  return Boolean(product.amazonAffiliateUrl.trim());
}

export function hasFlipkartOffer(product: StorefrontProduct) {
  return Boolean(product.flipkartAffiliateUrl.trim());
}

export function getListingDiscount(product: StorefrontProduct) {
  const discounts = [
    product.amazonDiscountPercentage,
    product.flipkartDiscountPercentage,
  ].filter(
    (value): value is number => value !== null && value > 0,
  );

  if (discounts.length === 0) {
    return null;
  }

  return Math.max(...discounts);
}
