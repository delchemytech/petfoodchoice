import type { ProductRow, ProductInsert } from "@/modules/common/types/database";
import { toProductImagePayload } from "@/modules/common/lib/product-images";
import { tryResolveAmazonProductUrls } from "./amazon-affiliate";
import { tryResolveFlipkartProductUrls } from "./flipkart-affiliate";
import { calculateDiscount } from "./scrape/sanitize";
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
    amazonSourceUrl: row.amazon_source_url ?? "",
    amazonAffiliateUrl: row.amazon_affiliate_url ?? "",
    amazonCurrentPrice:
      row.amazon_current_price !== null
        ? Number(row.amazon_current_price)
        : 0,
    amazonOriginalPrice:
      row.amazon_original_price !== null
        ? Number(row.amazon_original_price)
        : null,
    amazonDiscountPercentage:
      row.amazon_discount_percentage !== null
        ? Number(row.amazon_discount_percentage)
        : null,
    flipkartSourceUrl: row.flipkart_source_url ?? "",
    flipkartAffiliateUrl: row.flipkart_affiliate_url ?? "",
    flipkartCurrentPrice:
      row.flipkart_current_price !== null
        ? Number(row.flipkart_current_price)
        : null,
    flipkartOriginalPrice:
      row.flipkart_original_price !== null
        ? Number(row.flipkart_original_price)
        : null,
    flipkartDiscountPercentage:
      row.flipkart_discount_percentage !== null
        ? Number(row.flipkart_discount_percentage)
        : null,
    imageUrl: row.image_url ?? imageUrls[0] ?? "",
    imageUrls,
    name: row.name,
    slug: row.slug,
    brand: row.brand ?? "",
    category: row.category,
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

function resolveAmazonDiscount(
  values: AddProductFormValues,
  amazonCurrentPrice: number,
  amazonOriginalPrice: number | null,
) {
  const parsed = parseNumber(values.amazonDiscountPercentage);
  if (parsed !== null) return parsed;

  if (amazonOriginalPrice === null) return null;

  const calculated = calculateDiscount(
    String(amazonCurrentPrice),
    String(amazonOriginalPrice),
  );

  return calculated ? Number(calculated) : null;
}

function resolveFlipkartDiscount(
  values: AddProductFormValues,
  flipkartCurrentPrice: number | null,
  flipkartOriginalPrice: number | null,
) {
  const parsed = parseNumber(values.flipkartDiscountPercentage);
  if (parsed !== null) return parsed;

  if (flipkartCurrentPrice === null || flipkartOriginalPrice === null) {
    return null;
  }

  const calculated = calculateDiscount(
    String(flipkartCurrentPrice),
    String(flipkartOriginalPrice),
  );

  return calculated ? Number(calculated) : null;
}

export function mapFormToInsert(values: AddProductFormValues): ProductInsert {
  const images = toProductImagePayload(values.imageUrl, values.imageUrls);
  const amazonResolved = tryResolveAmazonProductUrls(values.amazonSourceUrl);
  const flipkartResolved = values.flipkartSourceUrl.trim()
    ? tryResolveFlipkartProductUrls(values.flipkartSourceUrl)
    : null;

  const amazonSourceUrl =
    amazonResolved?.sourceUrl ?? values.amazonSourceUrl.trim();
  const amazonAffiliateUrl =
    values.amazonAffiliateUrl.trim() ||
    amazonResolved?.affiliateUrl ||
    amazonSourceUrl;
  const amazonCurrentPrice = parseNumber(values.amazonCurrentPrice) ?? 0;
  const amazonOriginalPrice = parseNumber(values.amazonOriginalPrice);

  const flipkartSourceUrl =
    flipkartResolved?.sourceUrl ?? values.flipkartSourceUrl.trim();
  const flipkartAffiliateUrl =
    values.flipkartAffiliateUrl.trim() ||
    flipkartResolved?.affiliateUrl ||
    flipkartSourceUrl;
  const flipkartCurrentPrice = parseNumber(values.flipkartCurrentPrice);
  const flipkartOriginalPrice = parseNumber(values.flipkartOriginalPrice);

  return {
    amazon_source_url: amazonSourceUrl,
    amazon_affiliate_url: amazonAffiliateUrl,
    amazon_current_price: amazonCurrentPrice,
    amazon_original_price: amazonOriginalPrice,
    amazon_discount_percentage: resolveAmazonDiscount(
      values,
      amazonCurrentPrice,
      amazonOriginalPrice,
    ),
    flipkart_source_url: flipkartSourceUrl || null,
    flipkart_affiliate_url: flipkartAffiliateUrl || null,
    flipkart_current_price: flipkartCurrentPrice,
    flipkart_original_price: flipkartOriginalPrice,
    flipkart_discount_percentage: resolveFlipkartDiscount(
      values,
      flipkartCurrentPrice,
      flipkartOriginalPrice,
    ),
    image_url: images.image_url,
    image_urls: images.image_urls,
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    brand: values.brand.trim() || null,
    category: values.category,
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
    amazonSourceUrl: product.amazonSourceUrl,
    amazonAffiliateUrl: product.amazonAffiliateUrl,
    amazonCurrentPrice: String(product.amazonCurrentPrice),
    amazonOriginalPrice:
      product.amazonOriginalPrice !== null
        ? String(product.amazonOriginalPrice)
        : "",
    amazonDiscountPercentage:
      product.amazonDiscountPercentage !== null
        ? String(product.amazonDiscountPercentage)
        : "",
    flipkartSourceUrl: product.flipkartSourceUrl,
    flipkartAffiliateUrl: product.flipkartAffiliateUrl,
    flipkartCurrentPrice:
      product.flipkartCurrentPrice !== null
        ? String(product.flipkartCurrentPrice)
        : "",
    flipkartOriginalPrice:
      product.flipkartOriginalPrice !== null
        ? String(product.flipkartOriginalPrice)
        : "",
    flipkartDiscountPercentage:
      product.flipkartDiscountPercentage !== null
        ? String(product.flipkartDiscountPercentage)
        : "",
    imageUrl: product.imageUrl,
    imageUrls: product.imageUrls,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    category: product.category,
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
