import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/modules/common/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/admin")) {
    return "/admin/dashboard";
  }

  return value;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=unauthorized`);
}
