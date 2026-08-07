import type { Product } from "../types";

export function getProductStoreLabel(product: Product) {
  const stores: string[] = [];

  if (product.amazonAffiliateUrl.trim()) {
    stores.push("Amazon");
  }

  if (product.flipkartAffiliateUrl.trim()) {
    stores.push("Flipkart");
  }

  return stores.join(" · ") || "—";
}

export function getProductListingPrice(product: Product) {
  const prices = [
    product.amazonCurrentPrice,
    product.flipkartCurrentPrice,
  ].filter((price): price is number => price !== null && price > 0);

  if (prices.length === 0) {
    return product.amazonCurrentPrice;
  }

  return Math.min(...prices);
}

export function getAmazonDisplayPrice(product: Product): number | null {
  if (!product.amazonAffiliateUrl.trim()) {
    return null;
  }

  return product.amazonCurrentPrice > 0 ? product.amazonCurrentPrice : null;
}

export function getFlipkartDisplayPrice(product: Product): number | null {
  if (!product.flipkartAffiliateUrl.trim()) {
    return null;
  }

  if (product.flipkartCurrentPrice === null || product.flipkartCurrentPrice <= 0) {
    return null;
  }

  return product.flipkartCurrentPrice;
}
