export const AMAZON_ASSOCIATE_TAG = "petfoodchoice-21";

export const AMAZON_INDIA_HOSTS = new Set(["www.amazon.in", "amazon.in"]);

const ASIN_PATTERN = /[A-Z0-9]{10}/i;

export class AmazonUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AmazonUrlError";
  }
}

export function isAmazonIndiaHost(hostname: string) {
  return AMAZON_INDIA_HOSTS.has(hostname.toLowerCase());
}

export function extractAsinFromUrl(urlString: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(urlString.trim());
  } catch {
    return null;
  }

  const patterns = [
    /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})(?:[/?]|$)/i,
    /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = parsed.pathname.match(pattern);
    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }

  const queryAsin =
    parsed.searchParams.get("asin") || parsed.searchParams.get("ASIN");

  if (queryAsin && ASIN_PATTERN.test(queryAsin)) {
    return queryAsin.toUpperCase();
  }

  return null;
}

export function assertAmazonIndiaUrl(urlString: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(urlString.trim());
  } catch {
    throw new AmazonUrlError("Invalid URL format.");
  }

  if (parsed.protocol !== "https:") {
    throw new AmazonUrlError("Only HTTPS Amazon India URLs are allowed.");
  }

  if (!isAmazonIndiaHost(parsed.hostname)) {
    throw new AmazonUrlError(
      "Only amazon.in or www.amazon.in product URLs are allowed.",
    );
  }

  const asin = extractAsinFromUrl(parsed.href);
  if (!asin) {
    throw new AmazonUrlError(
      "Could not find a product ASIN in this Amazon URL.",
    );
  }

  return parsed;
}

export function buildAmazonIndiaAffiliateUrl(
  urlString: string,
  associateTag = AMAZON_ASSOCIATE_TAG,
): string {
  const parsed = assertAmazonIndiaUrl(urlString);
  const asin = extractAsinFromUrl(parsed.href);
  if (!asin) {
    throw new AmazonUrlError("Could not find a product ASIN in this Amazon URL.");
  }

  const pathPatterns = [
    new RegExp(`^(.*\\/dp\\/${asin})(?:\\/.*)?$`, "i"),
    new RegExp(`^(.*\\/gp\\/product\\/${asin})(?:\\/.*)?$`, "i"),
    new RegExp(`^(.*\\/gp\\/aw\\/d\\/${asin})(?:\\/.*)?$`, "i"),
    new RegExp(`^(.*\\/product\\/${asin})(?:\\/.*)?$`, "i"),
  ];

  for (const pattern of pathPatterns) {
    const match = parsed.pathname.match(pattern);
    if (match?.[1]) {
      return `https://${parsed.hostname.toLowerCase()}${match[1]}?tag=${associateTag}`;
    }
  }

  return `https://${parsed.hostname.toLowerCase()}/dp/${asin}?tag=${associateTag}`;
}

export function resolveAmazonProductUrls(urlString: string) {
  assertAmazonIndiaUrl(urlString);
  const affiliateUrl = buildAmazonIndiaAffiliateUrl(urlString);
  const sourceUrl = affiliateUrl.split("?")[0]!;

  return {
    sourceUrl,
    affiliateUrl,
  };
}

export function tryResolveAmazonProductUrls(urlString: string) {
  try {
    return resolveAmazonProductUrls(urlString);
  } catch {
    return null;
  }
}
