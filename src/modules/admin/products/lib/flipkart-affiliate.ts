export const FLIPKART_AFFILIATE_ID =
  process.env.NEXT_PUBLIC_FLIPKART_AFFILIATE_ID?.trim() ?? "";

export const FLIPKART_HOSTS = new Set(["www.flipkart.com", "flipkart.com"]);

export class FlipkartUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FlipkartUrlError";
  }
}

export function isFlipkartHost(hostname: string) {
  return FLIPKART_HOSTS.has(hostname.toLowerCase());
}

export function assertFlipkartUrl(urlString: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(urlString.trim());
  } catch {
    throw new FlipkartUrlError("Invalid URL format.");
  }

  if (parsed.protocol !== "https:") {
    throw new FlipkartUrlError("Only HTTPS Flipkart URLs are allowed.");
  }

  if (!isFlipkartHost(parsed.hostname)) {
    throw new FlipkartUrlError(
      "Only flipkart.com or www.flipkart.com product URLs are allowed.",
    );
  }

  if (!parsed.pathname || parsed.pathname === "/") {
    throw new FlipkartUrlError("Enter a Flipkart product page URL.");
  }

  return parsed;
}

export function buildFlipkartAffiliateUrl(
  urlString: string,
  affiliateId = FLIPKART_AFFILIATE_ID,
): string {
  const parsed = assertFlipkartUrl(urlString);

  if (affiliateId) {
    parsed.searchParams.set("affid", affiliateId);
  }

  return parsed.toString();
}

export function resolveFlipkartProductUrls(urlString: string) {
  assertFlipkartUrl(urlString);
  const affiliateUrl = buildFlipkartAffiliateUrl(urlString);
  const sourceUrl = affiliateUrl.split("?")[0]!;

  return {
    sourceUrl,
    affiliateUrl,
  };
}

export function tryResolveFlipkartProductUrls(urlString: string) {
  try {
    return resolveFlipkartProductUrls(urlString);
  } catch {
    return null;
  }
}
