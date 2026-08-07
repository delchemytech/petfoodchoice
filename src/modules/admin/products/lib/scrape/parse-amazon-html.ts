import * as cheerio from "cheerio";
import {
  MAX_PRODUCT_IMAGES,
  normalizeProductImageUrls,
} from "@/modules/common/lib/product-images";
import type { AddProductFormValues } from "../../types/add-product";
import {
  calculateDiscount,
  parsePriceNumber,
  sanitizeText,
  sanitizeUrl,
} from "./sanitize";
import { getCurrencyFromHostname } from "./validate-url";

const MAX_IMAGES = MAX_PRODUCT_IMAGES;

function extractImageUrlsFromDynamicData(
  dynamicImageData: string | undefined,
): string[] {
  if (!dynamicImageData) return [];

  try {
    const images = JSON.parse(dynamicImageData) as Record<string, unknown>;
    return Object.keys(images);
  } catch {
    return [];
  }
}

function extractImageUrls($: cheerio.CheerioAPI): string[] {
  const candidates: string[] = [];

  const landingImage = $("#landingImage");
  const oldHires = landingImage.attr("data-old-hires");
  if (oldHires) candidates.push(oldHires);

  candidates.push(
    ...extractImageUrlsFromDynamicData(landingImage.attr("data-a-dynamic-image")),
  );

  $("#altImages li").each((_, element) => {
    const item = $(element);
    const dynamicData =
      item.find("img").attr("data-a-dynamic-image") ||
      item.find("input[data-a-dynamic-image]").attr("data-a-dynamic-image");

    if (dynamicData) {
      candidates.push(...extractImageUrlsFromDynamicData(dynamicData));
      return;
    }

    const img = item.find("img").first();
    const hires =
      img.attr("data-old-hires") ||
      img.attr("data-src") ||
      img.attr("src");

    if (hires) candidates.push(hires);
  });

  $("#imageBlockThumbs img, .imageThumbnail img").each((_, element) => {
    const src =
      $(element).attr("data-old-hires") ||
      $(element).attr("data-src") ||
      $(element).attr("src");

    if (src) candidates.push(src);
  });

  const fallback =
    landingImage.attr("src") ||
    $("#imgBlkFront").attr("src") ||
    $("#ebooksImgBlkFront").attr("src");

  if (fallback) candidates.push(fallback);

  return normalizeProductImageUrls(candidates).slice(0, MAX_IMAGES);
}

function extractImageUrl($: cheerio.CheerioAPI): string {
  return extractImageUrls($)[0] ?? "";
}

function extractCurrentPrice($: cheerio.CheerioAPI): string {
  const candidates = [
    $(".priceToPay .a-offscreen").first().text(),
    $(".a-price .a-offscreen").first().text(),
    $("#priceblock_ourprice").text(),
    $("#priceblock_dealprice").text(),
    $("#corePrice_feature_div .a-offscreen").first().text(),
  ];

  for (const candidate of candidates) {
    const parsed = parsePriceNumber(candidate);
    if (parsed) return parsed;
  }

  return "";
}

function extractOriginalPrice($: cheerio.CheerioAPI): string {
  const candidates = [
    $(".basisPrice .a-offscreen").first().text(),
    $("span.a-text-price .a-offscreen").first().text(),
    $("#listPrice").text(),
    $(".a-price[data-a-strike] .a-offscreen").first().text(),
  ];

  for (const candidate of candidates) {
    const parsed = parsePriceNumber(candidate);
    if (parsed) return parsed;
  }

  return "";
}

function extractRating($: cheerio.CheerioAPI): string {
  const ratingText =
    $('span[data-hook="rating-out-of-text"]').first().text() ||
    $("#acrPopover").attr("title") ||
    "";

  const match = ratingText.match(/(\d+(?:\.\d+)?)/);
  return match?.[1] ?? "";
}

function extractReviewCount($: cheerio.CheerioAPI): string {
  const reviewText = $("#acrCustomerReviewText").text();
  const match = reviewText.replace(/,/g, "").match(/(\d+)/);
  return match?.[1] ?? "";
}

function extractBrand($: cheerio.CheerioAPI): string {
  const byline = sanitizeText($("#bylineInfo").text());

  return byline
    .replace(/^Visit the\s+/i, "")
    .replace(/^Brand:\s*/i, "")
    .replace(/\s+Store$/i, "")
    .trim();
}

function extractCategory($: cheerio.CheerioAPI): string {
  const breadcrumbs = $("#wayfinding-breadcrumbs_container li")
    .map((_, element) => sanitizeText($(element).text()))
    .get()
    .filter(Boolean);

  if (breadcrumbs.length >= 2) {
    return breadcrumbs[breadcrumbs.length - 2];
  }

  return "";
}

function extractDescription($: cheerio.CheerioAPI): string {
  const bulletPoints = $("#feature-bullets ul li span.a-list-item")
    .map((_, element) => sanitizeText($(element).text()))
    .get()
    .filter(Boolean);

  if (bulletPoints.length > 0) {
    return bulletPoints.join(" ");
  }

  return sanitizeText($("#productDescription p").first().text());
}

export function parseAmazonHtml(
  html: string,
  sourceUrl: string,
  affiliateUrl: string,
  finalUrl: string,
): AddProductFormValues {
  const $ = cheerio.load(html);
  const finalHostname = new URL(finalUrl).hostname;
  const currentPrice = extractCurrentPrice($);
  const originalPrice = extractOriginalPrice($);

  const imageUrls = extractImageUrls($);
  const name = sanitizeText($("#productTitle").text());

  return {
    amazonSourceUrl: sanitizeUrl(sourceUrl) || sanitizeUrl(finalUrl),
    amazonAffiliateUrl: sanitizeUrl(affiliateUrl) || sanitizeUrl(sourceUrl),
    amazonCurrentPrice: currentPrice,
    amazonOriginalPrice: originalPrice,
    amazonDiscountPercentage: calculateDiscount(currentPrice, originalPrice),
    flipkartSourceUrl: "",
    flipkartAffiliateUrl: "",
    flipkartCurrentPrice: "",
    flipkartOriginalPrice: "",
    flipkartDiscountPercentage: "",
    imageUrl: imageUrls[0] ?? "",
    imageUrls,
    name,
    slug: "",
    brand: extractBrand($),
    category: extractCategory($),
    currency: getCurrencyFromHostname(finalHostname),
    rating: extractRating($),
    totalReviews: extractReviewCount($),
    shortDescription: extractDescription($),
    status: "active",
  };
}
