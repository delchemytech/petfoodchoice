import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/modules/auth/lib/require-admin";
import { fetchAmazonProduct } from "@/modules/admin/bulk-fetch/lib/amazon/fetch-product";
import { sanitizeAsin } from "@/modules/admin/bulk-fetch/lib/amazon/validate";

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
    const asin = sanitizeAsin(payload.asin);

    if (!asin) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const result = await fetchAmazonProduct(asin);
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
      { error: "Could not load that product. Try again in a moment." },
      { status: 502 },
    );
  }
}
