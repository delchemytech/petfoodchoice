import { assertAllowedAmazonUrl } from "./validate-url";

const MAX_REDIRECTS = 5;
const MAX_HTML_BYTES = 5_000_000;
const FETCH_TIMEOUT_MS = 15_000;

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-IN,en;q=0.9",
};

export async function fetchAmazonPage(
  startUrl: string,
): Promise<{ html: string; finalUrl: string }> {
  let currentUrl = startUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    assertAllowedAmazonUrl(currentUrl);

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");

      if (!location) {
        throw new Error("Amazon redirect did not include a destination URL.");
      }

      currentUrl = new URL(location, currentUrl).href;
      continue;
    }

    if (!response.ok) {
      throw new Error(
        `Unable to fetch Amazon page. Server responded with ${response.status}.`,
      );
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      throw new Error("Amazon returned an unexpected response type.");
    }

    const html = await response.text();

    if (html.length > MAX_HTML_BYTES) {
      throw new Error("Amazon page response was too large to process.");
    }

    return { html, finalUrl: currentUrl };
  }

  throw new Error("Too many redirects while resolving the Amazon URL.");
}
