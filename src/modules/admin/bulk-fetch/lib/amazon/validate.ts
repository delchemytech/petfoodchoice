export function sanitizeKeyword(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const keyword = raw.trim().replace(/\s+/g, " ");
  if (keyword.length < 2 || keyword.length > 80) return null;
  if (/https?:\/\//i.test(keyword)) return null;
  if (/[<>{}\\[\]]/.test(keyword)) return null;
  return keyword;
}

export function sanitizePage(raw: unknown): number | null {
  const page = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isInteger(page) || page < 1 || page > 50) return null;
  return page;
}

export function isValidAsin(asin: string): boolean {
  return /^[A-Z0-9]{10}$/.test(asin);
}

export function sanitizeAsin(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const asin = raw.trim().toUpperCase();
  return isValidAsin(asin) ? asin : null;
}
