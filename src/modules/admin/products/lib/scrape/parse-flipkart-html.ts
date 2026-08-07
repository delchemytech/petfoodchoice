import * as cheerio from "cheerio";
import {
  calculateDiscount,
  parsePriceNumber,
  sanitizeUrl,
} from "./sanitize";

export interface FlipkartScrapeFields {
  flipkartSourceUrl: string;
  flipkartAffiliateUrl: string;
  flipkartCurrentPrice: string;
  flipkartOriginalPrice: string;
  flipkartDiscountPercentage: string;
  rating: string;
  totalReviews: string;
}

const PRICE_DOM_SELECTORS = [
  "div._30jeq3",
  "div[class*='Nx9bqj']",
  "div._3I9_wc",
  "div[class*='yRaY8j']",
  "div[class*='_3I9_wc']",
  "s",
];

const INLINE_PRICE_PAIR_PATTERNS = [
  /"mrp"\s*:\s*(\d+(?:\.\d+)?)[\s\S]{0,300}?"fsp"\s*:\s*(\d+(?:\.\d+)?)/i,
  /"fsp"\s*:\s*(\d+(?:\.\d+)?)[\s\S]{0,300}?"mrp"\s*:\s*(\d+(?:\.\d+)?)/i,
  /"mrp"\s*:\s*(\d+(?:\.\d+)?)[\s\S]{0,300}?"listingPrice"\s*:\s*(\d+(?:\.\d+)?)/i,
  /"listingPrice"\s*:\s*(\d+(?:\.\d+)?)[\s\S]{0,300}?"mrp"\s*:\s*(\d+(?:\.\d+)?)/i,
  /"strikeOff(?:Price|Value)"\s*:\s*(\d+(?:\.\d+)?)[\s\S]{0,300}?"fsp"\s*:\s*(\d+(?:\.\d+)?)/i,
  /"fsp"\s*:\s*(\d+(?:\.\d+)?)[\s\S]{0,300}?"strikeOff(?:Price|Value)"\s*:\s*(\d+(?:\.\d+)?)/i,
];

function isProductType(typeValue: unknown) {
  if (typeof typeValue === "string") {
    return typeValue.toLowerCase() === "product";
  }

  if (Array.isArray(typeValue)) {
    return typeValue.some(
      (value) => typeof value === "string" && value.toLowerCase() === "product",
    );
  }

  return false;
}

function readOfferPrices(offer: Record<string, unknown>) {
  function readPrice(value: unknown) {
    if (typeof value === "number" && value > 0) {
      return String(value);
    }

    if (typeof value === "string") {
      const parsed = parsePriceNumber(value);
      if (parsed) return parsed;
    }

    return "";
  }

  const low = offer.lowPrice;
  const high = offer.highPrice;
  const price = offer.price;

  let currentPrice = "";
  let originalPrice = "";

  if (low !== undefined) {
    currentPrice = readPrice(low);
  }

  if (high !== undefined) {
    originalPrice = readPrice(high);
  }

  if (!currentPrice && price !== undefined) {
    currentPrice = readPrice(price);
  }

  if (
    originalPrice &&
    currentPrice &&
    Number.parseFloat(originalPrice) <= Number.parseFloat(currentPrice)
  ) {
    originalPrice = "";
  }

  return { currentPrice, originalPrice };
}

function readAggregateRating(record: Record<string, unknown>) {
  const aggregateRating = record.aggregateRating;

  if (!aggregateRating || typeof aggregateRating !== "object") {
    return { rating: "", totalReviews: "" };
  }

  const ratingRecord = aggregateRating as Record<string, unknown>;
  let rating = "";
  let totalReviews = "";

  if (ratingRecord.ratingValue !== undefined) {
    const match = String(ratingRecord.ratingValue).match(/(\d+(?:\.\d+)?)/);
    if (match) rating = match[1];
  }

  const reviewCount = ratingRecord.reviewCount ?? ratingRecord.ratingCount;

  if (reviewCount !== undefined) {
    const match = String(reviewCount).replace(/,/g, "").match(/(\d+)/);
    if (match) totalReviews = match[1];
  }

  return { rating, totalReviews };
}

function walkJsonLdNode(
  node: unknown,
  onProduct: (record: Record<string, unknown>) => void,
) {
  if (!node || typeof node !== "object") return;

  const record = node as Record<string, unknown>;

  if (record["@graph"] && Array.isArray(record["@graph"])) {
    for (const graphNode of record["@graph"]) {
      walkJsonLdNode(graphNode, onProduct);
    }
  }

  if (isProductType(record["@type"])) {
    onProduct(record);
  }
}

function extractFromJsonLd(html: string) {
  const $ = cheerio.load(html);
  let currentPrice = "";
  let originalPrice = "";
  let rating = "";
  let totalReviews = "";

  $("script[type='application/ld+json']").each((_, element) => {
    const raw = $(element).html()?.trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];

      for (const node of nodes) {
        walkJsonLdNode(node, (record) => {
          const offers = record.offers;
          if (offers && typeof offers === "object") {
            const prices = readOfferPrices(offers as Record<string, unknown>);
            if (!currentPrice) currentPrice = prices.currentPrice;
            if (!originalPrice) originalPrice = prices.originalPrice;
          }

          const ratingData = readAggregateRating(record);
          if (!rating) rating = ratingData.rating;
          if (!totalReviews) totalReviews = ratingData.totalReviews;
        });
      }
    } catch {
      // Ignore invalid JSON-LD blocks.
    }
  });

  return { currentPrice, originalPrice, rating, totalReviews };
}

function extractPricesFromInlineJson(html: string) {
  let currentPrice = "";
  let originalPrice = "";
  let discountPercentage = "";

  for (const pattern of INLINE_PRICE_PAIR_PATTERNS) {
    const match = html.match(pattern);
    if (!match) continue;

    const first = Number.parseFloat(match[1]);
    const second = Number.parseFloat(match[2]);
    const min = Math.min(first, second);
    const max = Math.max(first, second);

    currentPrice = String(min);
    if (max > min) {
      originalPrice = String(max);
    }
    break;
  }

  if (!discountPercentage) {
    const discountMatch = html.match(
      /"discount(?:Percentage|Percent)"\s*:\s*(\d+)/i,
    );
    if (discountMatch) {
      discountPercentage = discountMatch[1];
    }
  }

  return { currentPrice, originalPrice, discountPercentage };
}

function collectDomPrices($: cheerio.CheerioAPI): number[] {
  const prices = new Set<number>();

  for (const selector of PRICE_DOM_SELECTORS) {
    $(selector).each((_, element) => {
      const parsed = parsePriceNumber($(element).text());
      if (!parsed) return;

      const value = Number.parseFloat(parsed);
      if (value > 0 && value < 10_000_000) {
        prices.add(value);
      }
    });
  }

  return [...prices].sort((left, right) => left - right);
}

function inferPricesFromCollection(
  prices: number[],
  knownCurrent?: string,
): { currentPrice: string; originalPrice: string } {
  if (prices.length === 0) {
    return { currentPrice: knownCurrent ?? "", originalPrice: "" };
  }

  const currentNum = knownCurrent
    ? Number.parseFloat(knownCurrent)
    : prices[0];
  const higherPrices = prices.filter((price) => price > currentNum);

  return {
    currentPrice: knownCurrent ?? String(prices[0]),
    originalPrice:
      higherPrices.length > 0 ? String(Math.max(...higherPrices)) : "",
  };
}

function extractCurrentPriceFromDom($: cheerio.CheerioAPI): string {
  const candidates = [
    $("div._30jeq3._16Jk6d").first().text(),
    $("div[class*='Nx9bqj']").first().text(),
    $("div[class*='_30jeq3']").first().text(),
    $("meta[property='og:price:amount']").attr("content"),
  ];

  for (const candidate of candidates) {
    const parsed = parsePriceNumber(candidate ?? "");
    if (parsed) return parsed;
  }

  return "";
}

function extractOriginalPriceFromDom($: cheerio.CheerioAPI): string {
  const candidates = [
    $("div._3I9_wc._2p6Jqk").first().text(),
    $("div[class*='yRaY8j']").first().text(),
    $("div[class*='_3I9_wc']").first().text(),
    $("s").first().text(),
  ];

  for (const candidate of candidates) {
    const parsed = parsePriceNumber(candidate ?? "");
    if (parsed) return parsed;
  }

  return "";
}

function extractMrpFromText(html: string): string {
  const patterns = [
    /M\.?\s*R\.?\s*P\.?\s*[:\s]*(?:₹|&#x20B9;|&nbsp;)?\s*([\d,]+(?:\.\d+)?)/gi,
    /Maximum\s+Retail\s+Price\s*[:\s]*(?:₹)?\s*([\d,]+(?:\.\d+)?)/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const parsed = parsePriceNumber(match[1]);
      if (parsed) return parsed;
    }
  }

  return "";
}

function extractDiscountFromDom($: cheerio.CheerioAPI): string {
  const candidates = [
    $("div[class*='UkUFwK']").first().text(),
    $("span[class*='UkUFwK']").first().text(),
  ];

  for (const candidate of candidates) {
    const match = candidate.match(/(\d+)\s*%/);
    if (match) return match[1];
  }

  return "";
}

function extractRatingFromDom($: cheerio.CheerioAPI): string {
  const candidates = [
    $("div.XQDdHH").first().text(),
    $("div[class*='XQDdHH']").first().text(),
    $("span.Wphh3K span").first().text(),
    $("div.hGSRpi").first().text(),
  ];

  for (const candidate of candidates) {
    const match = candidate.match(/(\d+(?:\.\d+)?)/);
    if (!match) continue;

    const value = Number.parseFloat(match[1]);
    if (value >= 0 && value <= 5) {
      return match[1];
    }
  }

  return "";
}

function extractReviewCountFromDom($: cheerio.CheerioAPI): string {
  const candidates = [
    $("span.Wphh3K").first().text(),
    $("span[class*='Wphh3K']").first().text(),
    $("div._2_R_DZ span").first().text(),
    $("div[class*='_2_R_DZ']").first().text(),
  ];

  for (const candidate of candidates) {
    const match = candidate.replace(/,/g, "").match(/(\d+)\s*(?:Ratings?)?/i);
    if (match && Number.parseInt(match[1], 10) > 0) {
      return match[1];
    }
  }

  return "";
}

function extractReviewCountFromText(html: string): string {
  const match = html.match(/(\d[\d,]*)\s+Ratings?\b/i);
  if (!match) return "";

  return match[1].replace(/,/g, "");
}

function resolveOriginalPrice(
  currentPrice: string,
  candidates: string[],
): string {
  const currentNum = Number.parseFloat(currentPrice);
  if (Number.isNaN(currentNum)) return "";

  let best = "";

  for (const candidate of candidates) {
    if (!candidate) continue;

    const originalNum = Number.parseFloat(candidate);
    if (Number.isNaN(originalNum) || originalNum <= currentNum) continue;

    if (!best || originalNum > Number.parseFloat(best)) {
      best = candidate;
    }
  }

  return best;
}

function resolveDiscountPercentage(
  currentPrice: string,
  originalPrice: string,
  candidates: string[],
): string {
  for (const candidate of candidates) {
    if (candidate) return candidate;
  }

  return calculateDiscount(currentPrice, originalPrice);
}

export function parseFlipkartHtml(
  html: string,
  sourceUrl: string,
  affiliateUrl: string,
  finalUrl: string,
): FlipkartScrapeFields {
  const $ = cheerio.load(html);
  const jsonLd = extractFromJsonLd(html);
  const inlineJson = extractPricesFromInlineJson(html);
  const domCurrent = extractCurrentPriceFromDom($);
  const domOriginal = extractOriginalPriceFromDom($);
  const domPrices = collectDomPrices($);
  const inferredPrices = inferPricesFromCollection(
    domPrices,
    jsonLd.currentPrice || inlineJson.currentPrice || domCurrent,
  );
  const mrpFromText = extractMrpFromText(html);

  const currentPrice =
    jsonLd.currentPrice ||
    inlineJson.currentPrice ||
    domCurrent ||
    inferredPrices.currentPrice;

  const originalPrice = resolveOriginalPrice(currentPrice, [
    jsonLd.originalPrice,
    inlineJson.originalPrice,
    domOriginal,
    inferredPrices.originalPrice,
    mrpFromText,
  ]);

  const discountPercentage = resolveDiscountPercentage(
    currentPrice,
    originalPrice,
    [
      inlineJson.discountPercentage,
      extractDiscountFromDom($),
    ],
  );

  const rating = jsonLd.rating || extractRatingFromDom($);
  const totalReviews =
    jsonLd.totalReviews ||
    extractReviewCountFromDom($) ||
    extractReviewCountFromText(html);

  return {
    flipkartSourceUrl: sanitizeUrl(sourceUrl) || sanitizeUrl(finalUrl),
    flipkartAffiliateUrl: sanitizeUrl(affiliateUrl) || sanitizeUrl(sourceUrl),
    flipkartCurrentPrice: currentPrice,
    flipkartOriginalPrice: originalPrice,
    flipkartDiscountPercentage: discountPercentage,
    rating,
    totalReviews,
  };
}
