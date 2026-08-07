import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/modules/common/types/database";
import { assertSupabaseConfigured } from "./env";

/**
 * Browser Supabase client with cookie-based session support.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = assertSupabaseConfigured();

  return createBrowserClient<Database>(url, anonKey);
}
