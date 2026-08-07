import type { AddProductFormValues } from "../../types/add-product";
import { slugifyProductName } from "../product-form-schema";
import { tryResolveFlipkartProductUrls } from "../flipkart-affiliate";
import { logScrapeResult } from "./log-scrape-result";
import { scrapeAmazonProduct } from "./scrape-amazon-product";
import { scrapeFlipkartProduct } from "./scrape-flipkart-product";

export interface ScrapeProductsResult {
  data: AddProductFormValues;
  warnings: string[];
}

function withSlug(data: AddProductFormValues): AddProductFormValues {
  return {
    ...data,
    slug: data.slug.trim() || slugifyProductName(data.name) || "product",
  };
}

function applyFlipkartUrls(
  data: AddProductFormValues,
  flipkartUrl: string,
): AddProductFormValues {
  const resolved = tryResolveFlipkartProductUrls(flipkartUrl);

  return {
    ...data,
    flipkartSourceUrl: resolved?.sourceUrl ?? flipkartUrl,
    flipkartAffiliateUrl: resolved?.affiliateUrl ?? flipkartUrl,
  };
}

export async function scrapeProducts(
  amazonUrl: string,
  flipkartUrl?: string,
): Promise<ScrapeProductsResult> {
  const data = withSlug(await scrapeAmazonProduct(amazonUrl));
  const warnings: string[] = [];
  const trimmedFlipkartUrl = flipkartUrl?.trim();

  if (!trimmedFlipkartUrl) {
    logScrapeResult(data, warnings, { amazonUrl, flipkartUrl });
    return { data, warnings };
  }

  try {
    const flipkart = await scrapeFlipkartProduct(trimmedFlipkartUrl);

    const merged = {
      data: withSlug({
        ...data,
        flipkartSourceUrl: flipkart.flipkartSourceUrl,
        flipkartAffiliateUrl: flipkart.flipkartAffiliateUrl,
        flipkartCurrentPrice: flipkart.flipkartCurrentPrice,
        flipkartOriginalPrice: flipkart.flipkartOriginalPrice,
        flipkartDiscountPercentage: flipkart.flipkartDiscountPercentage,
        rating: data.rating || flipkart.rating,
        totalReviews: data.totalReviews || flipkart.totalReviews,
      }),
      warnings,
    };

    logScrapeResult(merged.data, merged.warnings, {
      amazonUrl,
      flipkartUrl: trimmedFlipkartUrl,
    });

    return merged;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch Flipkart product details.";

    warnings.push(
      `Amazon details loaded, but Flipkart fetch failed: ${message}`,
    );

    const fallback = {
      data: withSlug(applyFlipkartUrls(data, trimmedFlipkartUrl)),
      warnings,
    };

    logScrapeResult(fallback.data, fallback.warnings, {
      amazonUrl,
      flipkartUrl: trimmedFlipkartUrl,
    });

    return fallback;
  }
}
