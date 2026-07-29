import {
  AmazonUrlError,
  assertAmazonIndiaUrl,
} from "../amazon-affiliate";

export class ScrapeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScrapeValidationError";
  }
}

export function assertAllowedAmazonUrl(urlString: string): URL {
  try {
    return assertAmazonIndiaUrl(urlString);
  } catch (error) {
    if (error instanceof AmazonUrlError) {
      throw new ScrapeValidationError(error.message);
    }
    throw error;
  }
}

export function getCurrencyFromHostname(hostname: string): string {
  const host = hostname.toLowerCase();

  if (host.endsWith(".in")) {
    return "INR";
  }

  return "INR";
}
