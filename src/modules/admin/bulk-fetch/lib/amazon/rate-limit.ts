import { AMAZON_SEARCH } from "./config";

let queue: Promise<unknown> = Promise.resolve();
let lastFinishedAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** One Amazon request at a time, with a gap between requests. */
export function withAmazonSlot<T>(fn: () => Promise<T>): Promise<T> {
  const run = async () => {
    const wait = AMAZON_SEARCH.minIntervalMs - (Date.now() - lastFinishedAt);
    if (lastFinishedAt > 0 && wait > 0) {
      await sleep(wait);
    }
    try {
      return await fn();
    } finally {
      lastFinishedAt = Date.now();
    }
  };

  const pending = queue.then(run, run);
  queue = pending.then(
    () => undefined,
    () => undefined,
  );
  return pending;
}
