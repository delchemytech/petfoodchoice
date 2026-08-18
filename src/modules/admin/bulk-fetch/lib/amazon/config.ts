export const AMAZON_SEARCH = {
  host: "www.amazon.in",
  origin: "https://www.amazon.in",
  batchPages: 10,
  maxPage: 50,
  minIntervalMs: 4000,
  duplicateStopRatio: 0.8,
  fetchTimeoutMs: 25_000,
  maxKeywordLength: 80,
} as const;
