const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const requestLog = new Map<string, number[]>();

export function assertRateLimit(key: string): void {
  const now = Date.now();
  const timestamps = (requestLog.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS,
  );

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new Error("Too many scrape requests. Please wait a minute and try again.");
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
}
