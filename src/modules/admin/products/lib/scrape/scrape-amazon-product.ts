import type { AddProductFormValues } from "../../types/add-product";
import { fetchAmazonPage } from "./fetch-amazon-page";
import { parseAmazonHtml } from "./parse-amazon-html";
import { assertAllowedAmazonUrl } from "./validate-url";

export async function scrapeAmazonProduct(
  affiliateUrl: string,
): Promise<AddProductFormValues> {
  assertAllowedAmazonUrl(affiliateUrl);

  const { html, finalUrl } = await fetchAmazonPage(affiliateUrl);
  const product = parseAmazonHtml(html, affiliateUrl, finalUrl);

  if (!product.name) {
    throw new Error(
      "Could not extract product details. Amazon may have blocked the request or changed the page layout.",
    );
  }

  return product;
}
