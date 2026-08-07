import { createSupabaseAnonServerClient } from "@/modules/common/lib/supabase/server";
import { resolveWebsiteId } from "./resolve-website";

export async function getCurrentWebsiteId(): Promise<string | null> {
  try {
    const supabase = createSupabaseAnonServerClient();
    return await resolveWebsiteId(supabase);
  } catch {
    return null;
  }
}
