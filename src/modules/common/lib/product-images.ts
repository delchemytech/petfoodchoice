import { sanitizeUrl } from "@/modules/admin/products/lib/scrape/sanitize";

export const MAX_PRODUCT_IMAGES = 10;

const AMAZON_IMAGE_ID_PATTERN = /\/images\/I\/([A-Za-z0-9+\-_]+)\./;

export function upscaleAmazonImageUrl(url: string): string {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return "";

  try {
    const parsed = new URL(sanitized);
    const isAmazonHost =
      parsed.hostname.includes("media-amazon.com") ||
      parsed.hostname.includes("ssl-images-amazon.com");

    if (!isAmazonHost) return sanitized;

    const match = parsed.pathname.match(AMAZON_IMAGE_ID_PATTERN);
    if (!match?.[1]) return sanitized;

    return `https://m.media-amazon.com/images/I/${match[1]}._SL1500_.jpg`;
  } catch {
    return sanitized;
  }
}

export function normalizeProductImageUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const url of urls) {
    const upscaled = upscaleAmazonImageUrl(url);
    if (!upscaled) continue;

    const dedupeKey = upscaled.replace(/\._[A-Z0-9_,]+_\./g, ".");
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    normalized.push(upscaled);

    if (normalized.length >= MAX_PRODUCT_IMAGES) break;
  }

  return normalized;
}

export function getPrimaryImageUrl(imageUrl: string, imageUrls: string[]) {
  const normalized = normalizeProductImageUrls(
    imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
  );

  return normalized[0] ?? "";
}

export function toProductImagePayload(imageUrl: string, imageUrls: string[]) {
  const normalized = normalizeProductImageUrls(
    imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
  );

  return {
    image_url: normalized[0] ?? null,
    image_urls: normalized,
  };
}

export function getDisplayImageUrls(imageUrl: string, imageUrls: string[]) {
  const normalized = normalizeProductImageUrls(
    imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [],
  );

  return normalized;
}
