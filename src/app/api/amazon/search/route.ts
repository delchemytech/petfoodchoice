import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/modules/auth/lib/require-admin";
import { fetchAmazonSearchPage } from "@/modules/admin/bulk-fetch/lib/amazon/fetch-search-page";
import { sanitizeKeyword, sanitizePage } from "@/modules/admin/bulk-fetch/lib/amazon/validate";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    await requireAdmin();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const keyword = sanitizeKeyword(payload.keyword);
    const page = sanitizePage(payload.page);

    if (!keyword || !page) {
      return NextResponse.json(
        { error: "Enter a brand or product name (2–80 characters) and a valid page." },
        { status: 400 },
      );
    }

    const result = await fetchAmazonSearchPage(keyword, page);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const message = error instanceof Error ? error.message : "";
    if (message.includes("Chrome") || message.includes("Edge")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Could not reach amazon.in. Try again in a moment." },
      { status: 502 },
    );
  }
}
