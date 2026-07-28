const ALLOWED_HOSTS = new Set([
  "www.amazon.in",
  "amazon.in",
  "www.amazon.com",
  "amazon.com",
  "amzn.to",
  "amzn.in",
  "www.amzn.in",
]);

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[::1\]$/,
];

export class ScrapeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScrapeValidationError";
  }
}

export function assertAllowedAmazonUrl(urlString: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(urlString.trim());
  } catch {
    throw new ScrapeValidationError("Invalid URL format.");
  }

  if (parsed.protocol !== "https:") {
    throw new ScrapeValidationError("Only HTTPS URLs are allowed.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new ScrapeValidationError("This URL is not allowed.");
  }

  if (!ALLOWED_HOSTS.has(hostname)) {
    throw new ScrapeValidationError(
      "Only Amazon affiliate URLs are supported for scraping.",
    );
  }

  return parsed;
}

export function getCurrencyFromHostname(hostname: string): string {
  const host = hostname.toLowerCase();

  if (host.endsWith(".in") || host === "amzn.in" || host === "www.amzn.in") {
    return "INR";
  }

  if (host.endsWith(".com") || host === "amzn.to") {
    return "USD";
  }

  return "INR";
}
