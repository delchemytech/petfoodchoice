import { resolveFlipkartProductUrls } from "../flipkart-affiliate";
import { fetchFlipkartPage } from "./fetch-flipkart-page";
import { parseFlipkartHtml, type FlipkartScrapeFields } from "./parse-flipkart-html";
import { assertAllowedFlipkartUrl } from "./validate-url";

export async function scrapeFlipkartProduct(
  productUrl: string,
): Promise<FlipkartScrapeFields> {
  assertAllowedFlipkartUrl(productUrl);

  const { sourceUrl, affiliateUrl } = resolveFlipkartProductUrls(productUrl);
  const { html, finalUrl } = await fetchFlipkartPage(sourceUrl);
  const product = parseFlipkartHtml(html, sourceUrl, affiliateUrl, finalUrl);

  if (!product.flipkartCurrentPrice) {
    throw new Error(
      "Could not extract Flipkart price. Flipkart may have blocked the request or changed the page layout.",
    );
  }

  return product;
}
