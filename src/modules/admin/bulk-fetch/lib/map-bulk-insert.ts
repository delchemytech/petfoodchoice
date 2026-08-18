import { toProductImagePayload } from "@/modules/common/lib/product-images";
import type { ProductInsert } from "@/modules/common/types/database";
import {
  mapFormValuesToProductAttributes,
  mapProductAttributesToInsert,
} from "@/modules/common/types/product-attributes";
import {
  calculateDiscount,
  parsePriceNumber,
  parseReviewCount,
  sanitizeText,
} from "@/modules/admin/products/lib/scrape/sanitize";
import { slugifyProductName } from "@/modules/admin/products/lib/product-form-schema";
import type { BulkFetchedProduct } from "../types";

function parseOptionalNumber(value: string): number | null {
  const parsed = parsePriceNumber(value);
  if (!parsed) return null;
  const number = Number.parseFloat(parsed);
  return Number.isNaN(number) ? null : number;
}

function parseOptionalRating(value: string): number | null {
  const parsed = parsePriceNumber(value);
  if (!parsed) return null;
  const number = Number.parseFloat(parsed);
  if (Number.isNaN(number) || number < 0 || number > 5) return null;
  return number;
}

function parseOptionalReviewCount(value: string): number | null {
  const parsed = parseReviewCount(value);
  if (!parsed) return null;
  const number = Number.parseInt(parsed, 10);
  return Number.isNaN(number) ? null : number;
}

export function allocateSlug(
  name: string,
  asin: string,
  used: Set<string>,
): string {
  const base =
    slugifyProductName(name) ||
    slugifyProductName(asin) ||
    "product";

  if (!used.has(base)) {
    used.add(base);
    return base;
  }

  const withAsin = slugifyProductName(`${base}-${asin}`) || `${base}-2`;
  if (!used.has(withAsin)) {
    used.add(withAsin);
    return withAsin;
  }

  let index = 2;
  let candidate = `${base}-${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }
  used.add(candidate);
  return candidate;
}

export function mapBulkFetchedToInsert(
  product: BulkFetchedProduct,
  options: {
    category: string;
    slug: string;
    websiteId: string;
  },
): ProductInsert | null {
  const name = sanitizeText(product.name, 200);
  const slug = options.slug.trim().toLowerCase();
  const amazonSourceUrl = product.amazonSourceUrl.trim();
  const amazonAffiliateUrl = product.amazonAffiliateUrl.trim();
  const amazonCurrentPrice = parseOptionalNumber(product.amazonCurrentPrice);

  if (
    !name ||
    !slug ||
    !amazonSourceUrl ||
    !amazonAffiliateUrl ||
    amazonCurrentPrice === null
  ) {
    return null;
  }

  const amazonOriginalPrice = parseOptionalNumber(product.amazonOriginalPrice);
  const amazonDiscountPercentage =
    parseOptionalNumber(product.amazonDiscountPercentage) ??
    (amazonOriginalPrice !== null
      ? parseOptionalNumber(
          calculateDiscount(
            String(amazonCurrentPrice),
            String(amazonOriginalPrice),
          ),
        )
      : null);

  const images = toProductImagePayload(product.imageUrl, product.imageUrls);
  const shortDescription = sanitizeText(product.shortDescription, 2000);

  return {
    website_id: options.websiteId,
    amazon_source_url: amazonSourceUrl,
    amazon_affiliate_url: amazonAffiliateUrl,
    amazon_current_price: amazonCurrentPrice,
    amazon_original_price: amazonOriginalPrice,
    amazon_discount_percentage: amazonDiscountPercentage,
    image_url: images.image_url,
    image_urls: images.image_urls,
    name,
    slug,
    brand: sanitizeText(product.brand, 100) || null,
    category: options.category,
    currency: "INR",
    rating: parseOptionalRating(product.rating),
    total_reviews: parseOptionalReviewCount(product.totalReviews),
    short_description: shortDescription || null,
    ...mapProductAttributesToInsert(mapFormValuesToProductAttributes(product)),
    status: "active",
    delete: false,
  };
}
