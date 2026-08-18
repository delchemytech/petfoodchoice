export function isAmazonHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "www.amazon.in" || host === "amazon.in";
  } catch {
    return false;
  }
}
