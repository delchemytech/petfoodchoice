const MAX_FIELD_LENGTH = 2000;
const MAX_URL_LENGTH = 2048;
export const PG_INTEGER_MAX = 2_147_483_647;

export function sanitizeText(
  value: string | null | undefined,
  maxLength = MAX_FIELD_LENGTH,
): string {
  if (!value) return "";

  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeUrl(value: string | null | undefined): string {
  if (!value) return "";

  const trimmed = value.trim().slice(0, MAX_URL_LENGTH);

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return "";
    return parsed.href;
  } catch {
    return "";
  }
}

export function parsePriceNumber(value: string): string {
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return "";

  const number = Number.parseFloat(match[1]);
  if (Number.isNaN(number)) return "";

  return Number.isInteger(number) ? String(number) : String(number);
}

export function calculateDiscount(
  currentPrice: string,
  originalPrice: string,
): string {
  const current = Number.parseFloat(currentPrice);
  const original = Number.parseFloat(originalPrice);

  if (
    Number.isNaN(current) ||
    Number.isNaN(original) ||
    original <= current
  ) {
    return "";
  }

  return String(Math.round(((original - current) / original) * 100));
}

export function parseReviewCount(value: string): string {
  const match = value.replace(/,/g, "").match(/(\d+)/);
  if (!match) return "";

  const parsed = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > PG_INTEGER_MAX) {
    return "";
  }

  return String(parsed);
}
