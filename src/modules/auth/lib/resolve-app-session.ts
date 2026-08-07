import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AdminUserRow, Database } from "@/modules/common/types/database";
import { resolveWebsiteId } from "@/modules/common/lib/website/resolve-website";

export type AppSession = {
  supabase: SupabaseClient<Database>;
  user: User;
  email: string;
  websiteId: string;
};

export type ResolveSessionResult =
  | { status: "ok"; session: AppSession }
  | { status: "failed" };

export async function resolveAppSession(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<ResolveSessionResult> {
  const email = user.email?.trim().toLowerCase();

  if (!email) {
    return { status: "failed" };
  }

  const { data, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("email", email)
    .maybeSingle();

  const adminUser = data as Pick<AdminUserRow, "id" | "email"> | null;

  if (adminError || !adminUser) {
    return { status: "failed" };
  }

  try {
    const websiteId = await resolveWebsiteId(supabase);

    return {
      status: "ok",
      session: {
        supabase,
        user,
        email: adminUser.email,
        websiteId,
      },
    };
  } catch {
    return { status: "failed" };
  }
}
