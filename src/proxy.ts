import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/modules/common/lib/supabase/middleware";

function getSafeNextPath(path: string | null) {
  if (path?.startsWith("/admin")) {
    return path;
  }

  return "/admin/dashboard";
}

function redirectToLogin(request: NextRequest, nextPath: string) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Public routes: /, /products/*, /blogs/*, /login, etc.
  if (!pathname.startsWith("/admin")) {
    if (pathname === "/login" && user) {
      const next = request.nextUrl.searchParams.get("next");
      return NextResponse.redirect(
        new URL(getSafeNextPath(next), request.url),
      );
    }

    return supabaseResponse;
  }

  // Protected: /admin and /admin/*
  if (!user) {
    return redirectToLogin(request, getSafeNextPath(pathname));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
