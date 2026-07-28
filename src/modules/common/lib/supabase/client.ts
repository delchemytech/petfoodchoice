import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseConfigured } from "./env";

/**
 * Browser Supabase client with cookie-based session support.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = assertSupabaseConfigured();

  return createBrowserClient(url, anonKey);
}
