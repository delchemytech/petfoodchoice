import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/modules/auth/lib/require-admin";
import { scrapeProducts } from "@/modules/admin/products/lib/scrape/scrape-products";
import { assertRateLimit } from "@/modules/admin/products/lib/scrape/rate-limit";
import { ScrapeValidationError } from "@/modules/admin/products/lib/scrape/validate-url";

export const runtime = "nodejs";

interface ScrapeRequestBody {
  amazonUrl?: string;
  flipkartUrl?: string;
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
    const amazonUrl = body.amazonUrl?.trim() || body.url?.trim();
    const flipkartUrl = body.flipkartUrl?.trim();

    if (!amazonUrl) {
      return NextResponse.json(
        { success: false, error: "Amazon product URL is required." },
        { status: 400 },
      );
    }

    const { data, warnings } = await scrapeProducts(amazonUrl, flipkartUrl);

    return NextResponse.json({
      success: true,
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
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
