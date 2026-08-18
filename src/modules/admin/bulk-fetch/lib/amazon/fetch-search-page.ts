import type { SearchPageResult } from "../../types";
import { AMAZON_SEARCH } from "./config";
import {
  getAmazonPage,
  isHeadedBrowser,
  switchToHeadedBrowser,
} from "./browser";
import { isAmazonHost } from "./host";
import { isAmazonBlockPage, parseSearchHtml } from "./parse-search";
import { withAmazonSlot } from "./rate-limit";

function searchUrl(keyword: string, page: number): string {
  const params = new URLSearchParams({
    k: keyword,
    page: String(page),
  });
  return `${AMAZON_SEARCH.origin}/s?${params.toString()}`;
}

async function loadSearchHtml(keyword: string, pageNumber: number): Promise<{
  html: string;
  finalUrl: string;
}> {
  const url = searchUrl(keyword, pageNumber);
  const page = await getAmazonPage();
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: AMAZON_SEARCH.fetchTimeoutMs,
  });

  await page
    .waitForSelector('[data-component-type="s-search-result"]', {
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

async function fetchSearchPage(
  keyword: string,
  page: number,
): Promise<SearchPageResult> {
  let loaded = await loadSearchHtml(keyword, page);

  if (
    (!isAmazonHost(loaded.finalUrl) || isAmazonBlockPage(loaded.html)) &&
    !isHeadedBrowser()
  ) {
    await switchToHeadedBrowser();
    loaded = await loadSearchHtml(keyword, page);
  }

  if (!isAmazonHost(loaded.finalUrl) || isAmazonBlockPage(loaded.html)) {
    return { products: [], hasNext: false, blocked: true, page };
  }

  const parsed = parseSearchHtml(loaded.html);
  if (
    parsed.products.length === 0 &&
    (isAmazonBlockPage(loaded.html) || loaded.html.length < 4000)
  ) {
    return { products: [], hasNext: false, blocked: true, page };
  }

  return { ...parsed, blocked: false, page };
}

export function fetchAmazonSearchPage(
  keyword: string,
  page: number,
): Promise<SearchPageResult> {
  return withAmazonSlot(() => fetchSearchPage(keyword, page));
}
