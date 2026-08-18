import { parseAmazonHtml } from "@/modules/admin/products/lib/scrape/parse-amazon-html";
import { tryResolveAmazonProductUrls } from "@/modules/admin/products/lib/amazon-affiliate";
import type { ProductDetailResult } from "../../types";
import { detailToBulkProduct } from "../map-fetched-product";
import { AMAZON_SEARCH } from "./config";
import {
  getAmazonPage,
  isHeadedBrowser,
  switchToHeadedBrowser,
} from "./browser";
import { isAmazonHost } from "./host";
import { isAmazonBlockPage } from "./parse-search";
import { withAmazonSlot } from "./rate-limit";
import { isValidAsin } from "./validate";

function productUrl(asin: string): string {
  return `${AMAZON_SEARCH.origin}/dp/${asin}`;
}

async function loadProductHtml(asin: string): Promise<{
  html: string;
  finalUrl: string;
}> {
  const url = productUrl(asin);
  const page = await getAmazonPage();
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: AMAZON_SEARCH.fetchTimeoutMs,
  });

  await page
    .waitForSelector("#productTitle, form[action*='validateCaptcha']", {
      timeout: AMAZON_SEARCH.fetchTimeoutMs,
    })
    .catch(() => undefined);

  const html = await page.content();
  const finalUrl = page.url();
  if (response && (response.status() === 503 || response.status() === 403)) {
    return { html, finalUrl };
  }
  return { html, finalUrl };
}

async function fetchProduct(asin: string): Promise<ProductDetailResult> {
  let loaded = await loadProductHtml(asin);

  if (
    (!isAmazonHost(loaded.finalUrl) || isAmazonBlockPage(loaded.html)) &&
    !isHeadedBrowser()
  ) {
    await switchToHeadedBrowser();
    loaded = await loadProductHtml(asin);
  }

  if (!isAmazonHost(loaded.finalUrl) || isAmazonBlockPage(loaded.html)) {
    return { product: null, blocked: true };
  }

  const urls = tryResolveAmazonProductUrls(productUrl(asin));
  const sourceUrl = urls?.sourceUrl ?? productUrl(asin);
  const affiliateUrl = urls?.affiliateUrl ?? sourceUrl;
  const parsed = parseAmazonHtml(
    loaded.html,
    sourceUrl,
    affiliateUrl,
    loaded.finalUrl,
  );

  if (!parsed.name) {
    return { product: null, blocked: false };
  }

  return { product: detailToBulkProduct(asin, parsed), blocked: false };
}

export function fetchAmazonProduct(asin: string): Promise<ProductDetailResult> {
  if (!isValidAsin(asin)) {
    return Promise.resolve({ product: null, blocked: false });
  }
  return withAmazonSlot(() => fetchProduct(asin));
}
