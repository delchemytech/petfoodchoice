import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/modules/common/lib/supabase/server";
import { resolveAppSession, type AppSession } from "./resolve-app-session";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export type { AppSession } from "./resolve-app-session";

export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const result = await resolveAppSession(supabase, user);

  if (result.status !== "ok") {
    return null;
  }

  return result.session;
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    throw new AuthError("Admin access required.");
  }

  return session;
}

export async function requireAdminOrRedirect(): Promise<AppSession> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await resolveAppSession(supabase, user);

  if (result.status === "ok") {
    return result.session;
  }

  await supabase.auth.signOut();
  redirect("/login?error=unauthorized");
}
