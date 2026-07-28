export function formatPrice(value: number, currency: string) {
  const locale = currency === "INR" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatReviewCount(count: number) {
  return new Intl.NumberFormat("en-IN").format(count);
}

export function formatSavings(
  currentPrice: number,
  originalPrice: number | null,
  currency: string,
) {
  if (originalPrice === null || originalPrice <= currentPrice) return null;
  return formatPrice(originalPrice - currentPrice, currency);
}
