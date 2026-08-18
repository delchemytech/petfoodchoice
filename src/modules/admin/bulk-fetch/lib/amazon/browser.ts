import type { Browser, BrowserContext, Page } from "playwright-core";

const IDLE_MS = 180_000;

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;
let headed = false;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

function bumpIdle(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    void closeAmazonBrowser();
  }, IDLE_MS);
}

async function launchWithChannel(headless: boolean): Promise<Browser> {
  const { chromium } = await import("playwright-core");
  const errors: string[] = [];

  for (const channel of ["chrome", "msedge"] as const) {
    try {
      return await chromium.launch({
        channel,
        headless,
        args: ["--disable-dev-shm-usage"],
      });
    } catch (error) {
      errors.push(
        `${channel}: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  throw new Error(
    `Install Google Chrome or Microsoft Edge to search amazon.in. (${errors.join("; ")})`,
  );
}

export async function getAmazonPage(): Promise<Page> {
  bumpIdle();
  if (page && !page.isClosed()) return page;

  browser = await launchWithChannel(!headed);
  context = await browser.newContext({
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    viewport: { width: 1365, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  page = await context.newPage();
  return page;
}

export async function switchToHeadedBrowser(): Promise<Page> {
  headed = true;
  await closeAmazonBrowser();
  return getAmazonPage();
}

export function isHeadedBrowser(): boolean {
  return headed;
}

export async function closeAmazonBrowser(): Promise<void> {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  const currentPage = page;
  const currentContext = context;
  const currentBrowser = browser;
  page = null;
  context = null;
  browser = null;
  await currentPage?.close().catch(() => undefined);
  await currentContext?.close().catch(() => undefined);
  await currentBrowser?.close().catch(() => undefined);
}
