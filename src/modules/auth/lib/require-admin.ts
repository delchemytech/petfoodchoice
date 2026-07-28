import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/modules/common/lib/supabase/server";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    return null;
  }

  return {
    supabase,
    user,
    email: admin.email,
  };
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    throw new AuthError("Admin access required.");
  }

  return session;
}

export async function requireAdminOrRedirect() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return {
    supabase,
    user,
    email: admin.email,
  };
}
