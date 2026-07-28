import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/modules/auth/lib/require-admin";
import { scrapeAmazonProduct } from "@/modules/admin/products/lib/scrape/scrape-amazon-product";
import { assertRateLimit } from "@/modules/admin/products/lib/scrape/rate-limit";
import { ScrapeValidationError } from "@/modules/admin/products/lib/scrape/validate-url";

export const runtime = "nodejs";

interface ScrapeRequestBody {
  url?: string;
}

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const clientKey = getClientKey(request);
    assertRateLimit(clientKey);

    const body = (await request.json()) as ScrapeRequestBody;
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Affiliate URL is required." },
        { status: 400 },
      );
    }

    const product = await scrapeAmazonProduct(url);

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    if (error instanceof ScrapeValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch product details.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
