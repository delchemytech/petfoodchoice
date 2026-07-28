import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/modules/common/lib/supabase/middleware";

function getSafeNextPath(pathname: string) {
  if (pathname.startsWith("/admin")) {
    return pathname;
  }

  return "/admin/dashboard";
}

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", getSafeNextPath(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && user) {
    const next = request.nextUrl.searchParams.get("next");
    const destination = getSafeNextPath(next ?? "/admin/dashboard");
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
