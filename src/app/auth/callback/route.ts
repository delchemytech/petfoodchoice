import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/modules/common/lib/supabase/server";
import { resolveAppSession } from "@/modules/auth/lib/resolve-app-session";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const result = await resolveAppSession(supabase, user);

        if (result.status === "ok") {
          return NextResponse.redirect(`${origin}${next}`);
        }

        await supabase.auth.signOut();
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=unauthorized`);
}
