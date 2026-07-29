import type { ProductRow, ProductInsert } from "@/modules/common/types/database";
import { toProductImagePayload } from "@/modules/common/lib/product-images";
import { tryResolveAmazonProductUrls } from "./amazon-affiliate";
import type { AddProductFormValues } from "../types/add-product";
import type { Product } from "../types";

function mapImageUrls(row: ProductRow): string[] {
  if (row.image_urls?.length) return row.image_urls;
  return row.image_url ? [row.image_url] : [];
}

export function mapProductRow(row: ProductRow): Product {
  const imageUrls = mapImageUrls(row);

  return {
    id: row.id,
    sourceUrl: row.source_url ?? row.affiliate_url,
    affiliateUrl: row.affiliate_url,
    imageUrl: row.image_url ?? imageUrls[0] ?? "",
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
    status: row.status,
    delete: row.delete,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFormToInsert(values: AddProductFormValues): ProductInsert {
  const images = toProductImagePayload(values.imageUrl, values.imageUrls);
  const resolved = tryResolveAmazonProductUrls(values.sourceUrl);

  return {
    source_url: resolved?.sourceUrl ?? values.sourceUrl.trim(),
    affiliate_url:
      values.affiliateUrl.trim() ||
      resolved?.affiliateUrl ||
      values.sourceUrl.trim(),
    image_url: images.image_url,
    image_urls: images.image_urls,
    name: values.name.trim(),
    brand: values.brand.trim() || null,
    store: values.store,
    category: values.category,
    current_price: parseNumber(values.currentPrice) ?? 0,
    original_price: parseNumber(values.originalPrice),
    discount_percentage: parseNumber(values.discountPercentage),
    currency: values.currency || "INR",
    rating: parseNumber(values.rating),
    total_reviews: parseInteger(values.totalReviews),
    short_description: values.shortDescription.trim() || null,
    status: values.status,
    delete: false,
  };
}

export function mapProductToFormValues(
  product: Product,
): AddProductFormValues {
  return {
    sourceUrl: product.sourceUrl,
    affiliateUrl: product.affiliateUrl,
    imageUrl: product.imageUrl,
    imageUrls: product.imageUrls,
    name: product.name,
    brand: product.brand,
    store: product.store as AddProductFormValues["store"],
    category: product.category,
    currentPrice: String(product.currentPrice),
    originalPrice:
      product.originalPrice !== null ? String(product.originalPrice) : "",
    discountPercentage:
      product.discountPercentage !== null
        ? String(product.discountPercentage)
        : "",
    currency: product.currency,
    rating: product.rating !== null ? String(product.rating) : "",
    totalReviews:
      product.totalReviews !== null ? String(product.totalReviews) : "",
    shortDescription: product.shortDescription,
    status: product.status,
  };
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseInteger(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
