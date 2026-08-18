import * as cheerio from "cheerio";
import { normalizeProductImageUrls } from "@/modules/common/lib/product-images";
import { parsePriceNumber, parseReviewCount, sanitizeText } from "@/modules/admin/products/lib/scrape/sanitize";
import { listingToBulkProduct } from "../map-fetched-product";
import { isValidAsin } from "./validate";
import type { BulkFetchedProduct } from "../../types";

function parseRating(text: string): string {
  const match = text.match(/(\d+(?:\.\d+)?)\s+out of\s+5/i);
  return match?.[1] ?? "";
}

export function isAmazonBlockPage(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes("validatecaptcha") ||
    lower.includes("enter the characters you see below") ||
    lower.includes("opfcaptcha") ||
    lower.includes("api-services-support@amazon.com") ||
    lower.includes("sorry, we just need to make sure you're not a robot") ||
    lower.includes("automated access to amazon") ||
    lower.includes("to discuss automated access") ||
    lower.includes("503 - service unavailable")
  );
}

export function parseSearchHtml(html: string): {
  products: BulkFetchedProduct[];
  hasNext: boolean;
} {
  const $ = cheerio.load(html);
  const products: BulkFetchedProduct[] = [];
  const seen = new Set<string>();

  $('[data-component-type="s-search-result"]').each((_, element) => {
    const node = $(element);
    const asin = (node.attr("data-asin") ?? "").trim().toUpperCase();
    if (!isValidAsin(asin) || seen.has(asin)) return;

    const title = sanitizeText(
      node.find("h2 a span").first().text() ||
        node.find("h2 span").first().text() ||
        node.find("h2").first().text(),
    );
    if (!title) return;

    const rawImage =
      node.find("img.s-image").attr("src") ||
      node.find("img.s-image").attr("data-src") ||
      "";
    const imageUrls = normalizeProductImageUrls(
      rawImage.startsWith("https://") ? [rawImage] : [],
    );

    const price = parsePriceNumber(
      node.find(".a-price:not(.a-text-price) .a-offscreen").first().text(),
    );
    const originalPrice = parsePriceNumber(
      node.find(".a-price.a-text-price .a-offscreen").first().text(),
    );

    const rating =
      parseRating(node.find(".a-icon-alt").first().text()) ||
      parseRating(
        node.find("[aria-label*='out of 5']").first().attr("aria-label") ?? "",
      );

    const totalReviews = parseReviewCount(
      node.find("a[href*='customerReviews'] span").last().text() ||
        node.find(".s-underline-text").last().text() ||
        node.find("[aria-label$='ratings']").first().attr("aria-label") ||
        "",
    );

    const brand = sanitizeText(
      node.find(".a-row .a-size-base-plus.a-color-base").first().text() ||
        node.find("[data-cy='title-recipe'] .a-size-base.a-color-base").first().text(),
    );

    seen.add(asin);
    products.push(
      listingToBulkProduct({
        asin,
        name: title,
        brand: brand && brand !== title ? brand : "",
        price,
        originalPrice,
        rating,
        totalReviews,
        imageUrl: imageUrls[0] ?? "",
        imageUrls,
      }),
    );
  });

  const next = $(".s-pagination-next").first();
  const hasNext =
    next.is("a") &&
    Boolean(next.attr("href")) &&
    !next.hasClass("s-pagination-disabled") &&
    next.attr("aria-disabled") !== "true";

  return { products, hasNext };
}
