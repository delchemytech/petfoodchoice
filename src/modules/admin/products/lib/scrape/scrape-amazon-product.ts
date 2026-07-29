import { resolveAmazonProductUrls } from "../amazon-affiliate";
import type { AddProductFormValues } from "../../types/add-product";
import { fetchAmazonPage } from "./fetch-amazon-page";
import { parseAmazonHtml } from "./parse-amazon-html";
import { assertAllowedAmazonUrl } from "./validate-url";

export async function scrapeAmazonProduct(
  productUrl: string,
): Promise<AddProductFormValues> {
  assertAllowedAmazonUrl(productUrl);

  const { sourceUrl, affiliateUrl } = resolveAmazonProductUrls(productUrl);
  const { html, finalUrl } = await fetchAmazonPage(sourceUrl);
  const product = parseAmazonHtml(html, sourceUrl, affiliateUrl, finalUrl);

  if (!product.name) {
    throw new Error(
      "Could not extract product details. Amazon may have blocked the request or changed the page layout.",
    );
  }

  return product;
}
